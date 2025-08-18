import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface PaymentFormProps {
  onSubmit: (data: any) => void
  loading?: boolean
}

// Interfaz abstracta para formularios de pago
export abstract class PaymentFormFactory {
  abstract createForm(props: PaymentFormProps): React.ReactElement
  abstract getProviderName(): string
  abstract getProviderBadge(): string
}

class StripeCreditCardFormFactory extends PaymentFormFactory {
  createForm({ onSubmit, loading }: PaymentFormProps): React.ReactElement {
    return (
      <Card key="stripe-credit-card-form" className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Tarjeta de Crédito
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Stripe
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ordenId">ID de Orden</Label>
              <Input id="ordenId" name="ordenId" type="number" required />
            </div>
            <div>
              <Label htmlFor="usuarioId">ID de Usuario</Label>
              <Input id="usuarioId" name="usuarioId" type="number" required />
            </div>
          </div>
          <div>
            <Label htmlFor="metodoPagoId">ID Método de Pago</Label>
            <Input id="metodoPagoId" name="metodoPagoId" type="number" value="1" readOnly />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subTotal">Subtotal</Label>
              <Input id="subTotal" name="subTotal" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="descuento">Descuento</Label>
              <Input id="descuento" name="descuento" type="number" step="0.01" defaultValue="0" />
            </div>
          </div>
          <div>
            <Label htmlFor="moneda">Moneda</Label>
            <Input id="moneda" name="moneda" defaultValue="USD" maxLength={3} />
          </div>
        </CardContent>
      </Card>
    )
  }

  getProviderName(): string {
    return "Tarjeta de Crédito (Stripe)"
  }

  getProviderBadge(): string {
    return "Stripe"
  }
}

class PayUCreditDebitFormFactory extends PaymentFormFactory {
  createForm({ onSubmit, loading }: PaymentFormProps): React.ReactElement {
    return (
      <Card key="payu-credit-debit-form" className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Tarjeta de Crédito/Débito
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              PayU
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ordenId">ID de Orden</Label>
              <Input id="ordenId" name="ordenId" type="number" required />
            </div>
            <div>
              <Label htmlFor="usuarioId">ID de Usuario</Label>
              <Input id="usuarioId" name="usuarioId" type="number" required />
            </div>
          </div>
          <div>
            <Label htmlFor="metodoPagoId">ID Método de Pago</Label>
            <Input id="metodoPagoId" name="metodoPagoId" type="number" value="2" readOnly />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subTotal">Subtotal</Label>
              <Input id="subTotal" name="subTotal" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="descuento">Descuento</Label>
              <Input id="descuento" name="descuento" type="number" step="0.01" defaultValue="0" />
            </div>
          </div>
          <div>
            <Label htmlFor="moneda">Moneda</Label>
            <Input id="moneda" name="moneda" defaultValue="COP" maxLength={3} />
          </div>
        </CardContent>
      </Card>
    )
  }

  getProviderName(): string {
    return "Tarjeta de Crédito/Débito (PayU)"
  }

  getProviderBadge(): string {
    return "PayU"
  }
}

class PayUNequiFormFactory extends PaymentFormFactory {
  createForm({ onSubmit, loading }: PaymentFormProps): React.ReactElement {
    return (
      <Card key="payu-nequi-form" className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pago con Nequi
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              PayU
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ordenId">ID de Orden</Label>
              <Input id="ordenId" name="ordenId" type="number" required />
            </div>
            <div>
              <Label htmlFor="usuarioId">ID de Usuario</Label>
              <Input id="usuarioId" name="usuarioId" type="number" required />
            </div>
          </div>
          <div>
            <Label htmlFor="metodoPagoId">ID Método de Pago</Label>
            <Input id="metodoPagoId" name="metodoPagoId" type="number" value="3" readOnly />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subTotal">Subtotal</Label>
              <Input id="subTotal" name="subTotal" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="descuento">Descuento</Label>
              <Input id="descuento" name="descuento" type="number" step="0.01" defaultValue="0" />
            </div>
          </div>
          <div>
            <Label htmlFor="moneda">Moneda</Label>
            <Input id="moneda" name="moneda" defaultValue="COP" maxLength={3} />
          </div>
        </CardContent>
      </Card>
    )
  }

  getProviderName(): string {
    return "Pago con Nequi (PayU)"
  }

  getProviderBadge(): string {
    return "PayU Nequi"
  }
}

class BankTransferFormFactory extends PaymentFormFactory {
  createForm({ onSubmit, loading }: PaymentFormProps): React.ReactElement {
    return (
      <Card key="bank-transfer-form" className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Transferencia Bancaria
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Bancaria
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ordenId">ID de Orden</Label>
              <Input id="ordenId" name="ordenId" type="number" required />
            </div>
            <div>
              <Label htmlFor="usuarioId">ID de Usuario</Label>
              <Input id="usuarioId" name="usuarioId" type="number" required />
            </div>
          </div>
          <div>
            <Label htmlFor="metodoPagoId">ID Método de Pago</Label>
            <Input id="metodoPagoId" name="metodoPagoId" type="number" value="4" readOnly />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subTotal">Subtotal</Label>
              <Input id="subTotal" name="subTotal" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="descuento">Descuento</Label>
              <Input id="descuento" name="descuento" type="number" step="0.01" defaultValue="0" />
            </div>
          </div>
          <div>
            <Label htmlFor="moneda">Moneda</Label>
            <Input id="moneda" name="moneda" defaultValue="COP" maxLength={3} />
          </div>
        </CardContent>
      </Card>
    )
  }

  getProviderName(): string {
    return "Transferencia Bancaria"
  }

  getProviderBadge(): string {
    return "Bancaria"
  }
}

export class PaymentFormFactoryProvider {
  static getFactory(
    providerType: "stripe_credit_card" | "payu_credit_debit" | "payu_nequi" | "bank_transfer",
  ): PaymentFormFactory {
    switch (providerType) {
      case "stripe_credit_card":
        return new StripeCreditCardFormFactory()
      case "payu_credit_debit":
        return new PayUCreditDebitFormFactory()
      case "payu_nequi":
        return new PayUNequiFormFactory()
      case "bank_transfer":
        return new BankTransferFormFactory()
      default:
        return new StripeCreditCardFormFactory()
    }
  }

  static getAvailableProviders(): Array<{
    id: string
    name: string
    type: "stripe_credit_card" | "payu_credit_debit" | "payu_nequi" | "bank_transfer"
    description: string
  }> {
    return [
      {
        id: "1",
        name: "Tarjeta de Crédito",
        type: "stripe_credit_card",
        description: "Procesado por Stripe",
      },
      {
        id: "2",
        name: "Tarjeta de Crédito/Débito",
        type: "payu_credit_debit",
        description: "Procesado por PayU",
      },
      {
        id: "3",
        name: "Pago con Nequi",
        type: "payu_nequi",
        description: "Procesado por PayU",
      },
      {
        id: "4",
        name: "Transferencia Bancaria",
        type: "bank_transfer",
        description: "Transferencia directa",
      },
    ]
  }
}
