import { IsNumber, Min, IsOptional, IsString, Length } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber() ordenId: number;
  @IsNumber() usuarioId: number;
  @IsNumber() metodoPagoId: number;

  @IsNumber() @Min(0) subTotal: number;
  @IsNumber() @Min(0) descuento: number;

  @IsOptional() @IsString() @Length(3,3) moneda?: string = 'COP';
}