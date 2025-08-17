export interface PaymentContext {
  ordenId: number;
  usuarioId: number;
  metodoPagoId: number;
  subTotal: number;
  descuento: number;
  moneda?: string;
  proveedor?: string;
  orden?: any;   
  total?: number;
}
