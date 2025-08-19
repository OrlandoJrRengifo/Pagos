import { IsInt, IsNumber, Min, IsOptional, IsString, Length } from 'class-validator'
import { Type } from 'class-transformer'

export class CreatePaymentDto {
  @IsInt()
  @Type(() => Number)
  ordenId!: number

  @IsInt()
  @Type(() => Number)
  usuarioId!: number

  @IsInt()
  @Type(() => Number)
  metodoPagoId!: number

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  subTotal!: number

  // puede venir vacío; por defecto 0
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  descuento?: number = 0

  // opcional; por defecto 'COP'
  @IsString()
  @IsOptional()
  @Length(3, 3)
  moneda?: string = 'COP'

  // opcional
  @IsString()
  @IsOptional()
  proveedor?: string
}
