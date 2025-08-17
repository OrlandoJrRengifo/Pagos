import { Injectable } from '@nestjs/common';
import { PaymentProviderFactory } from '../../provider-factory';
import { PaymentGateway } from '../../payment-gateway';
import { WebhookHandler } from '../../webhook-handler';

class PayUGateway implements PaymentGateway {
  async authorize({ amount, currency, orderId }: any) {
    return { ok: true, ref: `payu_${orderId}`, raw: { fake: true } };
  }
  async refund(ref: string) { return { ok: true, raw: { ref } }; }
}
class PayUWebhookHandler implements WebhookHandler {
  async verify(headers: Record<string,string>, body: any) { return { ok: true, event: 'payment_success', ref: 'payu_fake' }; }
  async handleEvent(event: any) {}
}

@Injectable()
export class PayUFactory implements PaymentProviderFactory {
  readonly providerName = 'payu';
  createGateway(): PaymentGateway { return new PayUGateway(); }
  createWebhookHandler(): WebhookHandler { return new PayUWebhookHandler(); }
}
