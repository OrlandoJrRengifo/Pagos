"use client"

import { useState, useCallback } from "react"
import { paymentApi } from "../services/payment-api"
import type { CreatePaymentDto, Payment } from "../types/payment"
import { PaymentValidationChain } from "../validators/payment-validator"

export const usePayments = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null)

  const validator = new PaymentValidationChain()

  const createPayment = useCallback(async (paymentData: CreatePaymentDto) => {
    setLoading(true)
    setError(null)

    try {
      // Aplicar Chain of Responsibility para validación
      const validationResult = validator.validate(paymentData)

      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(", "))
      }

      const newPayment = await paymentApi.createPayment(paymentData)
      setPayments((prev) => [...prev, newPayment])
      return newPayment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getPayment = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      const payment = await paymentApi.getPayment(id)
      setCurrentPayment(payment)
      return payment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAllPayments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const allPayments = await paymentApi.getAllPayments()
      setPayments(allPayments)
      return allPayments
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    payments,
    currentPayment,
    createPayment,
    getPayment,
    getAllPayments,
  }
}
