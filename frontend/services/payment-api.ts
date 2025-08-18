import { httpProxy } from "./http-proxy"
import type { CreatePaymentDto, Payment } from "../types/payment"

export class PaymentApiService {
  async createPayment(paymentData: CreatePaymentDto): Promise<Payment> {
    return httpProxy.post<Payment>("/payments", paymentData)
  }

  async getPayment(id: number): Promise<Payment> {
    return httpProxy.get<Payment>(`/payments/${id}`)
  }

  async getAllPayments(): Promise<Payment[]> {
    // Nota: Este endpoint no está en el backend, pero lo incluimos para completitud
    return httpProxy.get<Payment[]>("/payments")
  }
}

export const paymentApi = new PaymentApiService()
