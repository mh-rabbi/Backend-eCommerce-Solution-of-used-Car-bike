import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class InitializePaymentDto {
  @IsNumber()
  vehicleId: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}

export class SSLCommerzIpnDto {
  @IsString()
  tran_id: string;

  @IsOptional()
  @IsString()
  val_id?: string;

  @IsOptional()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsString()
  card_type?: string;

  @IsOptional()
  @IsString()
  bank_tran_id?: string;

  @IsString()
  status: string;
}
