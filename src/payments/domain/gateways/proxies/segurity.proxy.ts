import { PaymentGateway } from '../payment-gateway';
import { HttpException, HttpStatus } from '@nestjs/common';

export class SecurityProxy implements PaymentGateway {
  constructor(
    private readonly inner: PaymentGateway,
    private readonly apiToken: string,
  ) {}

  async authorize(args: any) {
    this.ensureAuthorized();
    console.log('[SecurityProxy] Llamada authorize permitida (segura).');
    return this.inner.authorize(args);
  }

  async refund(ref: string, amount?: number) {
    this.ensureAuthorized();
    console.log('[SecurityProxy] Llamada refund permitida (segura).');
    return this.inner.refund(ref, amount);
  }

  async verifyWebhook(headers: any, body: any) {
    this.ensureAuthorized();
    console.log('[SecurityProxy] Llamada verifyWebhook permitida (segura).');
    if (!this.inner.verifyWebhook) {
      throw new HttpException(
        { message: 'verifyWebhook no implemetado por inner gateway' },
        HttpStatus.NOT_IMPLEMENTED, // 501
      );
    }
    return this.inner.verifyWebhook(headers, body);
  }

  private ensureAuthorized() {
    if (!this.apiToken) {
      throw new HttpException(
        { message: 'Unauthorized: falta API token' },
        HttpStatus.UNAUTHORIZED, // 401
      );
    }
    console.log('[SecurityProxy] 🔒 API token válido, acceso autorizado.');
  }
}
