"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaymentFormFactoryProvider } from "../factories/payment-form-factory"
import { usePayments } from "../hooks/use-payments"
import type { CreatePaymentDto, Currency } from "../types/payment"

export const PaymentForm: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<
    "stripe_credit_card" | "payu_credit_debit" | "payu_nequi" | "bank_transfer"
  >("stripe_credit_card")
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("COP")
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
      moneda: selectedCurrency,
    }

    try {
      await createPayment(paymentData)
      alert("Pago creado exitosamente")
      e.currentTarget.reset()
      setSelectedCurrency("COP")
    } catch (err) {
      console.error("Error al crear pago:", err)
    }
  }

  // Usar Abstract Factory para crear el formulario dinámicamente
  const factory = PaymentFormFactoryProvider.getFactory(selectedProvider)
  const providers = PaymentFormFactoryProvider.getAvailableProviders()

  const currencies: { value: Currency; label: string; symbol: string }[] = [
    { value: "COP", label: "Peso Colombiano", symbol: "$" },
    { value: "USD", label: "Dólar Estadounidense", symbol: "$" },
    { value: "EUR", label: "Euro", symbol: "€" },
  ]

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Crear Nuevo Pago</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
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

        <div>
          <label className="block text-sm font-medium mb-2">Moneda</label>
          <Select value={selectedCurrency} onValueChange={(value: Currency) => setSelectedCurrency(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una moneda" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{currency.symbol}</span>
                    <div className="flex flex-col">
                      <span>{currency.value}</span>
                      <span className="text-xs text-muted-foreground">{currency.label}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Abstract Factory crea el formulario dinámicamente */}
        {factory.createForm({ onSubmit: handleSubmit, loading, currency: selectedCurrency })}

        <div className="mt-6">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Procesando..." : "Crear Pago"}
          </Button>
        </div>
      </form>
    </div>
  )
}
