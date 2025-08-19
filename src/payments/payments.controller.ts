import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Headers,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.service.crearPago({
      ...dto,
      descuento: dto.descuento ?? 0,
      moneda: dto.moneda ?? 'COP',
    });
  }

  // ✅ NUEVO: GET /payments
  @Get()
  getAll() {
    return this.service.getAll();
  }

  // ✅ GET /payments/:id (sin tocar el repo desde el controller)
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const pago = await this.service.getById(id);
    if (!pago) {
      throw new NotFoundException(`No se encontró pago con id ${id}`);
    }
    return pago;
  }

  @Post('webhook/:proveedor')
  webhook(
    @Param('proveedor') proveedor: string,
    @Headers() headers: Record<string, string>,
    @Body() body: any,
  ) {
    return this.service.procesarWebhook(headers, body, proveedor);
  }
}
