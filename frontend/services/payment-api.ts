import { httpProxy } from "./http-proxy";
import type { CreatePaymentDto, Payment } from "../types/payment";

// Normaliza el path (sin barra final)
const PATH = (process.env.NEXT_PUBLIC_API_PATH ?? "/payments").replace(/\/+$/, "");

export class PaymentApiService {
  createPayment(data: CreatePaymentDto): Promise<Payment> {
    return httpProxy.post<Payment>(PATH, data);
  }

  getPayment(id: number | string): Promise<Payment> {
    return httpProxy.get<Payment>(`${PATH}/${id}`);
  }

  // OJO: en tu backend no existe GET /payments (lista).
  // Si decides crearlo en Nest, esto ya está listo.
  // Si no, elimina este método o haz que lance un error.
  getAllPayments(): Promise<Payment[]> {
    return httpProxy.get<Payment[]>(PATH);
  }
}

export const paymentApi = new PaymentApiService();
