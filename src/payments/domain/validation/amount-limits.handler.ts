import { Handler } from './handler';
import { HttpException, HttpStatus } from '@nestjs/common';

export class AmountLimitsHandler extends Handler {
  constructor(private readonly max: number) { super(); }

  protected async doHandle(ctx: { subTotal: number; descuento: number }) {
    const total = ctx.subTotal - (ctx.descuento ?? 0);

    if (total <= 0) {
      throw new HttpException(
        { message: 'Total debe ser mayor que 0' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (total > this.max) {
      throw new HttpException(
        { message: `Total supera el límite permitido (${this.max})` },
        HttpStatus.BAD_REQUEST,
      );
    }

    (ctx as any).total = total;
  }
}
