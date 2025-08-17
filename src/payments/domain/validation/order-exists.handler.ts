import { Handler } from './handler';
import { PaymentsRepository } from '../../infra/payments.repository';
import { HttpException, HttpStatus } from '@nestjs/common';

export class OrderExistsHandler extends Handler {
  constructor(private readonly repo: PaymentsRepository) {
    super();
  }

  protected async doHandle(ctx: any) {
    const orden = await this.repo.findOrdenById(ctx.ordenId);

    if (!orden) {
      throw new HttpException(
        `Orden con ID ${ctx.ordenId} no existe`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (!orden.activa) {
      throw new HttpException(
        `Orden con ID ${ctx.ordenId} no está activa`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // pasar la orden al contexto
    ctx.orden = orden;
  }
}