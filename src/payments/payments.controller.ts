import { Body, Controller, Get, Param, Post, Query, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.service.crearPago(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const pago = await this.service['repo'].findById(Number(id));
    if (!pago) {
      return { message: `No se encontró pago con id ${id}` };
    }
    return pago;
  }


  @Post('webhook/:proveedor')
  webhook(@Param('proveedor') proveedor: string, @Headers() headers: any, @Body() body: any) {
    return this.service.procesarWebhook(headers, body, proveedor);
  }
}