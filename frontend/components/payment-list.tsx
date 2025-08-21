"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye } from "lucide-react"
import { usePayments } from "../hooks/use-payments"
import { PaymentDetailsModal } from "./payment-details-modal"
import type { Payment } from "../types/payment"

const getPaymentMethodInfo = (metodo?: { nombre: string; proveedor: string }) => {
  if (!metodo) return { name: "Desconocido", provider: "N/A", color: "bg-gray-100 text-gray-800" }
  
  return {
    name: metodo.nombre,
    provider: metodo.proveedor,
    color: "bg-blue-100 text-blue-800", // o puedes asignar según proveedor si quieres
  }
}

export const PaymentList: React.FC = () => {
  const { getAllPayments, getPayment, payments, loading, error } = usePayments()
  const [searchId, setSearchId] = useState("")
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    getAllPayments().catch(console.error)
  }, [getAllPayments])

  useEffect(() => {
    if (searchId.trim() === "") {
      setFilteredPayments(payments)
    } else {
      const filtered = payments.filter(
        (payment) => payment.id.toString().includes(searchId) || payment.ordenId.toString().includes(searchId),
      )
      setFilteredPayments(filtered)
    }
  }, [payments, searchId])

  const handleRefresh = () => {
    getAllPayments().catch(console.error)
  }

  const handleSearchById = async () => {
    if (searchId.trim() === "") return

    try {
      const payment = await getPayment(Number.parseInt(searchId))
      if (payment) {
        setFilteredPayments([payment])
      }
    } catch (err) {
      console.error("Error buscando pago:", err)
    }
  }

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPayment(null)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold">Lista de Pagos</h2>
        <Button onClick={handleRefresh} disabled={loading}>
          {loading ? "Cargando..." : "Actualizar"}
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar por ID de pago o ID de orden..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchById()}
              />
            </div>
            <Button onClick={handleSearchById} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchId("")
                setFilteredPayments(payments)
              }}
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {filteredPayments.length === 0 && !loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {searchId ? "No se encontraron pagos con ese ID" : "No hay pagos disponibles"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPayments.map((payment) => {
            const methodInfo = getPaymentMethodInfo(payment.metodo)
            const subTotal = payment.subTotal ?? 0;
            const descuento = payment.descuento ?? 0;
            const total = payment.total ?? subTotal - descuento;

            return (
              <Card
                key={payment.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handlePaymentClick(payment)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span>Pago #{payment.id}</span>
                      <Badge variant="secondary" className={methodInfo.color}>
                        {methodInfo.provider}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-muted-foreground">Orden #{payment.ordenId}</span>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Usuario</p>
                      <p className="text-sm text-muted-foreground">{payment.usuario?.nombre || "Desconocido"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Método</p>
                      <p className="text-sm text-muted-foreground">{payment.metodo?.nombre || "Desconocido"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Subtotal</p>
                      <p className="text-sm text-muted-foreground">
                        {subTotal.toFixed(2)} {payment.moneda || "COP"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-sm font-semibold text-green-600">
                        {total.toFixed(2)} {payment.moneda || "COP"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <PaymentDetailsModal payment={selectedPayment} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}
