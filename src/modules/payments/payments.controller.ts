import { Controller, Get, Post, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { PaymentStatus } from './entities/payment.entity';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private vehiclesService: VehiclesService,
  ) {}

  @Post('vehicle/:vehicleId')
  @UseGuards(JwtAuthGuard)
  async createPayment(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    // Calculate 10% of vehicle price
    const vehicle = await this.vehiclesService.findOne(vehicleId);
    const amount = Number(vehicle.price) * 0.1;
    return this.paymentsService.create(vehicleId, amount);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmPayment(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.confirmPayment(id);
  }

  @Get('vehicle/:vehicleId')
  @UseGuards(JwtAuthGuard)
  async getPaymentByVehicle(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    return this.paymentsService.findByVehicle(vehicleId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll(@Query('status') status?: PaymentStatus) {
    return this.paymentsService.findAll(status);
  }
}

