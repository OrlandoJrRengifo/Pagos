import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentsRepository } from './infra/payments.repository';
import { GatewayFactory } from './domain/gateways/factories/gateway-factory';
import { LoggingProxy } from './domain/gateways/proxies/logging.proxy';
import { SecurityProxy } from './domain/gateways/proxies/segurity.proxy';
import { AmountLimitsHandler } from './domain/validation/amount-limits.handler';
import { OrderExistsHandler } from './domain/validation/order-exists.handler';

type CrearPagoInput = {
  ordenId: number;
  usuarioId: number;
  metodoPagoId: number;
  subTotal: number;
  moneda: string;
  descuento?: number;
  proveedor?: string;
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly gatewayFactory: GatewayFactory,
  ) {}

  // ========= LECTURAS usadas por el controller =========
  async getAll() {
    if (typeof (this.repo as any).list === 'function') {
      return (this.repo as any).list();
    }
    const prisma: any = (this.repo as any).prisma ?? (this.repo as any)['prisma'];
    if (prisma?.pago?.findMany) return prisma.pago.findMany({ orderBy: { id: 'desc' } });
    if (prisma?.pagos?.findMany) return prisma.pagos.findMany({ orderBy: { id: 'desc' } });
    return [];
  }

  async getById(id: number) {
    if (typeof (this.repo as any).findById === 'function') {
      return (this.repo as any).findById(id);
    }
    const prisma: any = (this.repo as any).prisma ?? (this.repo as any)['prisma'];
    if (prisma?.pago?.findUnique) return prisma.pago.findUnique({ where: { id } });
    if (prisma?.pagos?.findUnique) return prisma.pagos.findUnique({ where: { id } });
    return null;
  }
  // =====================================================

  async crearPago(input: CrearPagoInput) {
    // 1) Validaciones (Chain of Responsibility)
    const chain = new AmountLimitsHandler(5_000_000).setNext(
      new OrderExistsHandler(this.repo),
    );
    await chain.handle(input);

    // 2) Resolver método/proveedor
    const prisma: any = (this.repo as any).prisma ?? (this.repo as any)['prisma'];
    const metodo = await prisma?.metodos_pago?.findUnique?.({
      where: { id: input.metodoPagoId },
    });

    const proveedor = input.proveedor ?? metodo?.proveedor;
    if (!metodo || !metodo.activo || !proveedor) {
      throw new HttpException('Metodo no disponible', HttpStatus.BAD_REQUEST);
    }

    // 3) Guardar pago "pendiente"
    const pago = await this.repo.create({
      orden: { connect: { id: input.ordenId } },
      usuario: { connect: { id: input.usuarioId } },
      metodo: { connect: { id: input.metodoPagoId } },
      sub_total: input.subTotal,
      descuento: input.descuento ?? 0,
      moneda: input.moneda ?? 'COP',
      estado: 'pendiente',
    });

    // 4) Preparar gateway (Abstract Factory + Proxy)
    const providerFactory = this.gatewayFactory.getFactory(proveedor);
    const concreteGateway = providerFactory.createGateway();
    const securedGateway = new SecurityProxy(
      concreteGateway,
      process.env.GATEWAY_TOKEN ?? '',
    );
    const gateway = new LoggingProxy(securedGateway);

    // 5) Autorizar
    const amount =
      Number((input as any).total) ??
      Math.max(0, Number(input.subTotal) - Number(input.descuento ?? 0));
    const orderIdStr = String((pago as any).orden_id ?? input.ordenId);

    const res = await gateway.authorize({
      amount,
      currency: (pago as any).moneda ?? input.moneda ?? 'COP',
      orderId: orderIdStr,
    });

    // 6) Registrar evento
    await this.repo.createEvento(
      (pago as any).id,
      'autorizacion',
      res.raw ?? {},
      res.ref,
    );

    // 7) Manejar resultado
    if (!res.ok) {
      await this.repo.updateEstado((pago as any).id, 'rechazado');
      throw new HttpException(
        'Pago rechazado por la pasarela',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.repo.updateEstado((pago as any).id, 'autorizado');

    // 8) Devolver pago
    return this.repo.findById((pago as any).id);
  }

  // 9) Webhook
  async procesarWebhook(
    headers: Record<string, string>,
    body: any,
    proveedor: string,
  ) {
    const providerFactory = this.gatewayFactory.getFactory(proveedor);
    const handler = providerFactory.createWebhookHandler();
    const ver = await handler.verify(headers, body);
    if (!ver.ok) return { ok: false };
    return { ok: true, event: ver.event };
  }
}
