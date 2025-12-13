import { IsString, IsNumber, IsEnum, IsArray, IsOptional, Min } from 'class-validator';
import { VehicleType } from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  brand: string;

  @IsEnum(VehicleType)
  type: VehicleType;

  @IsNumber()
  @Min(0)
  price: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

