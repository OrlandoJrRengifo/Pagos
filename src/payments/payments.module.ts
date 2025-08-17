import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './infra/payments.repository';
import { PrismaService } from '../database/prisma.service';

import { GatewayFactory } from './domain/gateways/factories/gateway-factory';
import { StripeFactory } from './domain/gateways/factories/providers/stripe.factory';
import { PayUFactory } from './domain/gateways/factories/providers/payu.factory';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentsRepository,
    PrismaService,

    // Factories concretas de cada API de pagos
    StripeFactory,
    PayUFactory,

    // Creamos una instancia de GatewayFactory y le registramos las factories segun el proveedor
    {
      provide: GatewayFactory,
      useFactory: (stripe: StripeFactory, payu: PayUFactory) => {
        const gf = new GatewayFactory();
        gf.register(stripe);
        gf.register(payu);
        return gf;
      },
      inject: [StripeFactory, PayUFactory],
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
