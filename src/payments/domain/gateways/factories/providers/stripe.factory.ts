import { Injectable } from '@nestjs/common';
import { PaymentProviderFactory } from '../../provider-factory';
import { PaymentGateway } from '../../payment-gateway';
import { WebhookHandler } from '../../webhook-handler';

// reutiliza/crea las clases de gateway/webhook (stubs)
class StripeGateway implements PaymentGateway {
  constructor(private apiKey?: string) {}
  async authorize({ amount, currency, orderId }: any) {
    return { ok: true, ref: `stripe_${orderId}`, raw: { fake: true } };
  }
  async refund(ref: string) { return { ok: true, raw: { ref } }; }
}
class StripeWebhookHandler implements WebhookHandler {
  async verify(headers: Record<string,string>, body: any) { return { ok: true, event: 'payment_success', ref: 'stripe_fake' }; }
  async handleEvent(event: any) { /* handle */ }
}

@Injectable()
export class StripeFactory implements PaymentProviderFactory {
  readonly providerName = 'stripe';
  createGateway(): PaymentGateway { return new StripeGateway(process.env.STRIPE_SECRET); }
  createWebhookHandler(): WebhookHandler { return new StripeWebhookHandler(); }
}
