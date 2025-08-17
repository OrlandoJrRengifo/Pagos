import { PaymentGateway } from '../payment-gateway';

export class LoggingProxy implements PaymentGateway {
  constructor(private readonly inner: PaymentGateway) {}
  // Caturar el tiempo de cada uno
  async authorize(args: { amount:number; currency:string; orderId:string }) {
    const t0 = Date.now();
    const res = await this.inner.authorize(args);
    console.log(`[Gateway][authorize] provider call ms=${Date.now()-t0} ok=${res.ok} order=${args.orderId}`);
    return res;
  }

  async capture(ref: string) {
    const t0 = Date.now();
    const res = await this.inner.capture?.(ref);
    console.log(`[Gateway][capture] ms=${Date.now()-t0} ref=${ref} ok=${res?.ok}`);
    return res!;
  }

  async refund(ref: string, amount?: number) {
    const t0 = Date.now();
    const res = await this.inner.refund(ref, amount);
    console.log(`[Gateway][refund] ms=${Date.now()-t0} ref=${ref} amount=${amount} ok=${res.ok}`);
    return res;
  }

  async verifyWebhook(headers: Record<string,string>, body: any) {
    const t0 = Date.now();
    const res = await this.inner.verifyWebhook?.(headers, body);
    console.log(`[Gateway][verifyWebhook] ms=${Date.now()-t0} event=${res?.event}`);
    return res!;
  }
}
