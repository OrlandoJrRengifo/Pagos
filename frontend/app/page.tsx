"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentForm } from "../components/payment-form"
import { PaymentList } from "../components/payment-list"

export default function PaymentsApp() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Sistema de Pagos</h1>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="flex w-full flex-wrap justify-center gap-2">
            <TabsTrigger value="create">Crear Pago</TabsTrigger>
            <TabsTrigger value="list">Lista de Pagos</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <PaymentForm />
          </TabsContent>

          <TabsContent value="list">
            <PaymentList />
          </TabsContent>
        </Tabs>
      </div>
    </div >
  )
}
