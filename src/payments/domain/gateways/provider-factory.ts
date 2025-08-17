import { PaymentGateway } from './payment-gateway';
import { WebhookHandler } from './webhook-handler';

export interface PaymentProviderFactory {
  readonly providerName: string; // stripe, payu...
  createGateway(): PaymentGateway;
  createWebhookHandler(): WebhookHandler;
  // si se necesita mas objetos por porveedor se añaden aqui
}
