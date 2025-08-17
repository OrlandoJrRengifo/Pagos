import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PaymentsRepository } from './infra/payments.repository';
import { GatewayFactory } from './domain/gateways/factories/gateway-factory';
import { LoggingProxy } from './domain/gateways/proxies/logging.proxy';
import { SecurityProxy } from './domain/gateways/proxies/segurity.proxy';
import { AmountLimitsHandler } from './domain/validation/amount-limits.handler';
import { OrderExistsHandler } from './domain/validation/order-exists.handler';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly repo: PaymentsRepository,
    private readonly gatewayFactory: GatewayFactory, 
  ) {}

  async crearPago(input: { ordenId:number; usuarioId:number; metodoPagoId:number; subTotal:number; descuento:number; moneda?:string; proveedor?: string }) {
    // Validaciones en cadena (Chain of Responsibility)
    const chain = new AmountLimitsHandler(5_000_000)
                .setNext(new OrderExistsHandler(this.repo));
                 

    await chain.handle(input);

    // Buscar proveedor en supabase
    const metodo = await this.repo['prisma'].metodos_pago.findUnique({ where: { id: input.metodoPagoId } });
    const proveedor = input.proveedor ?? metodo?.proveedor;
    if (!metodo || !metodo.activo || !proveedor) throw new Error('Metodo no disponible');

    // Guardar pago como "pendiente"
    const orden = (input as any).orden;
    const pago = await this.repo.create({
      orden: { connect: { id: orden.id } },
      usuario: { connect: { id: input.usuarioId } },
      metodo: { connect: { id: input.metodoPagoId } },
      sub_total: input.subTotal,
      descuento: input.descuento ?? 0,
      moneda: input.moneda ?? 'COP',
      estado: 'pendiente',
    });

    // Obtener la factory del proveedor (Abstract Factory)
    const providerFactory = this.gatewayFactory.getFactory(proveedor);
    // Crear el gateway concreto necesario (cada factory implementa createGateway())
    const concreteGateway = providerFactory.createGateway(); // devuelve PaymentGateway

    // Envolver el objeto en proxies security y logging (Proxy)
    const securedGateway = new SecurityProxy(concreteGateway, process.env.GATEWAY_TOKEN ?? '');
    const gateway = new LoggingProxy(securedGateway); 

    const amount = Number((input as any).total);
    // Autorizar
    const res = await gateway.authorize({ amount, currency: pago.moneda, orderId: String(pago.orden_id) });

    // Registrar evento en historial
    await this.repo.createEvento((pago as any).id, 'autorizacion', res.raw ?? {}, res.ref);

    // Manejar resultado
    if (!res.ok) {
      await this.repo.updateEstado((pago as any).id, 'rechazado');
       throw new HttpException(`Pago rechazado por la pasarela`, HttpStatus.BAD_REQUEST,
      );
    }
    await this.repo.updateEstado((pago as any).id, 'autorizado');

    // Devolver pago completo 
    return await this.repo.findById((pago as any).id);
  }

  // Verificar disponibilidad del Webhook 
  async procesarWebhook(headers: Record<string,string>, body: any, proveedor: string) {
    // Obtener la factory del proveedor (Abstract Factory)
    const providerFactory = this.gatewayFactory.getFactory(proveedor);
    // Crear el gateway concreto necesario
    const handler = providerFactory.createWebhookHandler();
    const ver = await handler.verify(headers, body);
    if (!ver.ok) return { ok: false };
    return { ok: true, event: ver.event };
  }
}
