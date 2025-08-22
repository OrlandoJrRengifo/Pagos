import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.pagosCreateInput) {
    const sub_total = new Prisma.Decimal(data.sub_total?.toString() || '0');
    const descuento = new Prisma.Decimal(data.descuento?.toString() || '0');
    const total = sub_total.minus(descuento);

    return this.prisma.pagos.create({
      data: {
        ...data,
        sub_total,
        descuento,
        total,
      },
      include: {
        usuario: true,
        metodo: true,
        orden: true,
        eventos: true,
      },
    });
  }

  findById(id: number) {
    return this.prisma.pagos.findUnique({
      where: { id },
      include: {
        usuario: true,
        metodo: true,
        orden: true,
        eventos: true,
      },
    });
  }

  findAll() {
    return this.prisma.pagos.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        orden_id: true,
        usuario_id: true,
        metodo_pago_id: true,
        sub_total: true,
        descuento: true,
        total: true,
        estado: true,
        moneda: true,
        fecha_creacion: true,
        fecha_actualizacion: true,
        usuario: true,
        metodo: true,
        orden: true,
      },
    })
  }

  updateEstado(
    id: number,
    estado: 'pendiente' | 'autorizado' | 'rechazado' | 'reembolsado',
  ) {
    return this.prisma.pagos.update({ where: { id }, data: { estado } });
  }

  createEvento(pagoId: number, tipo: string, payload: any, referencia?: string) {
    return this.prisma.pagos_transacciones.create({
      data: { pago: { connect: { id: pagoId } }, tipo, payload, referencia_externa: referencia },
    });
  }

  findOrdenById(id: number) {
    return this.prisma.ordenes.findUnique({ where: { id } });
  }

  getMetodoPagoById(id: number) {
    return this.prisma.metodos_pago.findUnique({ where: { id } });
  }
}
