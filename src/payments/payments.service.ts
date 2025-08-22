import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentsRepository } from './infra/payments.repository';
import { GatewayFactory } from './domain/gateways/factories/gateway-factory';
import { LoggingProxy } from './domain/gateways/proxies/logging.proxy';
import { SecurityProxy } from './domain/gateways/proxies/segurity.proxy';
import { AmountLimitsHandler } from './domain/validation/amount-limits.handler';
import { OrderExistsHandler } from './domain/validation/order-exists.handler';
import { Prisma } from '@prisma/client';

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

  async getAll() {
    const pagos = await this.repo.findAll();
    return pagos.map(p => ({
      ...p,
      subTotal: p.sub_total instanceof Prisma.Decimal ? p.sub_total.toNumber() : p.sub_total,
      descuento: p.descuento instanceof Prisma.Decimal ? p.descuento.toNumber() : p.descuento,
      total: p.total instanceof Prisma.Decimal ? p.total.toNumber() : p.total,
      usuario: p.usuario,
      metodo: p.metodo,
    }));
  }

  async getById(id: number) {
    const p = await this.repo.findById(id);
    if (!p) return null;
    return {
      ...p,
      subTotal: p.sub_total instanceof Prisma.Decimal ? p.sub_total.toNumber() : p.sub_total,
      descuento: p.descuento instanceof Prisma.Decimal ? p.descuento.toNumber() : p.descuento,
      total: p.total instanceof Prisma.Decimal ? p.total.toNumber() : p.total,
      usuario: p.usuario,
      metodo: p.metodo,
    };
  }

  async crearPago(input: CrearPagoInput) {
    
    const chain = new AmountLimitsHandler(5_000_000).setNext(
      new OrderExistsHandler(this.repo),
    );
    await chain.handle(input);

    const metodo = await this.repo.getMetodoPagoById(input.metodoPagoId);


    const proveedor = input.proveedor ?? metodo?.proveedor;
    if (!metodo || !metodo.activo || !proveedor) {
      throw new HttpException('Metodo no disponible', HttpStatus.BAD_REQUEST);
    }

    const pago = await this.repo.create({
      orden: { connect: { id: Number(input.ordenId) } },
      usuario: { connect: { id: Number(input.usuarioId) } },
      metodo: { connect: { id: Number(input.metodoPagoId) } },
      sub_total: new Prisma.Decimal(input.subTotal),
      descuento: new Prisma.Decimal(input.descuento ?? 0),
      total: new Prisma.Decimal((input.subTotal ?? 0) - (input.descuento ?? 0)),
      moneda: input.moneda ?? 'COP',
      estado: 'pendiente',
    });

    const providerFactory = this.gatewayFactory.getFactory(proveedor);
    const concreteGateway = providerFactory.createGateway();
    const securedGateway = new SecurityProxy(
      concreteGateway,
      process.env.GATEWAY_TOKEN ?? '',
    );
    const gateway = new LoggingProxy(securedGateway);

    const subtotalNum: number = pago.sub_total instanceof Prisma.Decimal 
      ? pago.sub_total.toNumber() 
      : pago.sub_total;

    const descuentoNum: number = pago.descuento instanceof Prisma.Decimal
      ? pago.descuento.toNumber()
      : pago.descuento;

    const totalNum: number = pago.total != null 
      ? (pago.total instanceof Prisma.Decimal ? pago.total.toNumber() : pago.total) 
      : subtotalNum - descuentoNum;

    const amount: number = totalNum;

    const orderIdStr = String(pago.orden_id);

    const res = await gateway.authorize({
      amount,
      currency: pago.moneda ?? input.moneda ?? 'COP',
      orderId: String(pago.orden_id ?? input.ordenId),
    });

    await this.repo.createEvento(pago.id, 'autorizacion', res.raw ?? {}, res.ref);

    if (!res.ok) {
      await this.repo.updateEstado(pago.id, 'rechazado');
      throw new HttpException(
        'Pago rechazado por la pasarela',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.repo.updateEstado(pago.id, 'autorizado');

    return this.repo.findById(pago.id);
  }

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
