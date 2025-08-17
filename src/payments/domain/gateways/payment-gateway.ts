export interface PaymentGateway {
  authorize(args: { amount: number; currency: string; orderId: string }): Promise<{ ok: boolean; ref?: string; raw?: any }>;
  capture?(ref: string): Promise<{ ok: boolean; raw?: any }>;
  refund(ref: string, amount?: number): Promise<{ ok: boolean; raw?: any }>;
  verifyWebhook?(headers: Record<string,string>, body: any): Promise<{ ok: boolean; event?: string; ref?: string; raw?: any }>;
}
