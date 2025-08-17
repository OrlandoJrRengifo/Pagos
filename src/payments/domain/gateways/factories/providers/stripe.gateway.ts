import { PaymentGateway } from "../../payment-gateway";

export class StripeGateway implements PaymentGateway {
  constructor(private apiKey: string) {}

  async authorize(args: { amount: number; currency: string; orderId: string }) {
    return { ok: true, ref: `stripe_${args.orderId}`, raw: { fake: true } };
  }

  async capture(ref: string) {
    return { ok: true, raw: { captured: true, ref } };
  }

  async refund(ref: string, amount?: number) {
    return { ok: true, raw: { refunded: true, ref, amount } };
  }

  async verifyWebhook(headers: Record<string,string>, body: any) {
    return { ok: true, event: "payment_success", ref: "stripe_fake_ref", raw: body };
  }
}