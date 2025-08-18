"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaymentFormFactoryProvider } from "../factories/payment-form-factory"
import { usePayments } from "../hooks/use-payments"
import type { CreatePaymentDto } from "../types/payment"

export const PaymentForm: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<
    "stripe_credit_card" | "payu_credit_debit" | "payu_nequi" | "bank_transfer"
  >("stripe_credit_card")
  const { createPayment, loading, error } = usePayments()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const paymentData: CreatePaymentDto = {
      ordenId: Number(formData.get("ordenId")),
      usuarioId: Number(formData.get("usuarioId")),
      metodoPagoId: Number(formData.get("metodoPagoId")),
      subTotal: Number(formData.get("subTotal")),
      descuento: Number(formData.get("descuento")),
      moneda: (formData.get("moneda") as string) || "COP",
    }

    try {
      await createPayment(paymentData)
      alert("Pago creado exitosamente")
      e.currentTarget.reset()
    } catch (err) {
      console.error("Error al crear pago:", err)
    }
  }

  // Usar Abstract Factory para crear el formulario dinámicamente
  const factory = PaymentFormFactoryProvider.getFactory(selectedProvider)
  const providers = PaymentFormFactoryProvider.getAvailableProviders()

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Crear Nuevo Pago</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Seleccionar Método de Pago</label>
        <Select value={selectedProvider} onValueChange={(value: any) => setSelectedProvider(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un método de pago" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.type}>
                <div className="flex flex-col">
                  <span>{provider.name}</span>
                  <span className="text-xs text-muted-foreground">{provider.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Abstract Factory crea el formulario dinámicamente */}
        {factory.createForm({ onSubmit: handleSubmit, loading })}

        <div className="mt-6">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Procesando..." : "Crear Pago"}
          </Button>
        </div>
      </form>
    </div>
  )
}
