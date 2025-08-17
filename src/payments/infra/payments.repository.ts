import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.pagosCreateInput) {
    return this.prisma.pagos.create({
      data
    });
  }

  findById(id: number) {
    return this.prisma.pagos.findUnique({ where: { id } });
  }

  updateEstado(id: number, estado: 'pendiente'|'autorizado'|'rechazado'|'reembolsado') {
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
}