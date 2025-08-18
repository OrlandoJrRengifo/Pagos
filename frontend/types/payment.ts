export interface CreatePaymentDto {
  ordenId: number
  usuarioId: number
  metodoPagoId: number
  subTotal: number
  descuento: number
  moneda?: string
}

export interface Payment extends CreatePaymentDto {
  id: number
  total: number
  estado: string
  fechaCreacion: string
  fechaActualizacion: string
}

export interface PaymentProvider {
  id: number
  name: string
  type: "stripe_credit_card" | "payu_credit_debit" | "payu_nequi" | "bank_transfer"
  description: string
}

export type PaymentMethod = {
  id: number
  name: string
  provider: string
  type: "stripe_credit_card" | "payu_credit_debit" | "payu_nequi" | "bank_transfer"
}
