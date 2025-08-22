"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Payment } from "../types/payment"

interface PaymentDetailsModalProps {
  payment: Payment | null
  isOpen: boolean
  onClose: () => void
}

const getPaymentMethodInfo = (metodoPagoId: number) => {
  const methods: Record<number, { name: string; provider: string; color: string }> = {
    1: { name: "Tarjeta de Crédito", provider: "Stripe", color: "bg-blue-100 text-blue-800" },
    2: { name: "Tarjeta de Crédito/Débito", provider: "PayU", color: "bg-green-100 text-green-800" },
    3: { name: "Pago con Nequi", provider: "PayU", color: "bg-purple-100 text-purple-800" },
    4: { name: "Transferencia Bancaria", provider: "Bancaria", color: "bg-orange-100 text-orange-800" },
  }
  return methods[metodoPagoId] || { name: "Desconocido", provider: "N/A", color: "bg-gray-100 text-gray-800" }
}

const getStatusBadge = (estado: string) => {
  const statusColors: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-800",
    completado: "bg-green-100 text-green-800",
    fallido: "bg-red-100 text-red-800",
    cancelado: "bg-gray-100 text-gray-800",
  }
  return statusColors[estado.toLowerCase()] || "bg-gray-100 text-gray-800"
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ payment, isOpen, onClose }) => {
  if (!payment) return null

  const methodInfo = getPaymentMethodInfo(payment.metodo?.id ?? 0)
  const total = payment.total ?? (payment.subTotal ?? 0) - (payment.descuento ?? 0)

  const fechaCreacionRaw = payment.fechaCreacion || (payment as any).fecha_creacion
  const fechaActualizacionRaw = payment.fechaActualizacion || (payment as any).fecha_actualizacion

  const fechaCreacion = fechaCreacionRaw ? new Date(fechaCreacionRaw).toLocaleString() : "N/A"
  const fechaActualizacion = fechaActualizacionRaw ? new Date(fechaActualizacionRaw).toLocaleString() : "N/A"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalles del Pago #{payment.id}
            <Badge className={getStatusBadge(payment.estado)}>{payment.estado}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Orden</p>
              <p className="text-lg font-semibold">#{payment.orden?.id ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Usuario</p>
              <p className="text-lg font-semibold">{payment.usuario?.nombre ?? "Desconocido"}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Método de Pago</p>
            <div className="flex items-center gap-2">
              <span className="font-medium">{methodInfo.name}</span>
              <Badge variant="secondary" className={methodInfo.color}>
                {methodInfo.provider}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>
                {(payment.subTotal ?? 0).toFixed(2)} {payment.moneda || "COP"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Descuento:</span>
              <span className="text-red-600">
                -{(payment.descuento ?? 0).toFixed(2)} {payment.moneda || "COP"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>
                {total.toFixed(2)} {payment.moneda || "COP"}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha de Creación:</span>
              <span>{fechaCreacion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última Actualización:</span>
              <span>{fechaActualizacion}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
