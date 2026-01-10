import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe, Query, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { VehicleType } from '../vehicles/entities/vehicle.entity';
import { InitializePaymentDto, SSLCommerzIpnDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private paymentsService: PaymentsService,
    private vehiclesService: VehiclesService,
  ) {}

  /**
   * Initialize payment for a vehicle post (called after vehicle is created)
   */
  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  async initializePayment(@Body() dto: InitializePaymentDto) {
    this.logger.log(`Initializing payment for vehicle: ${dto.vehicleId}`);
    return this.paymentsService.initializePayment(dto.vehicleId, dto.paymentMethod);
  }

  /**
   * Calculate platform fee for a vehicle (used by mobile app checkout page)
   */
  @Get('calculate-fee/:vehicleId')
  @UseGuards(JwtAuthGuard)
  async calculateFee(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    this.logger.log(`Calculating fee for vehicle: ${vehicleId}`);
    const vehicle = await this.vehiclesService.findOne(vehicleId);
    const { fee, percentage } = this.paymentsService.calculatePlatformFee(vehicle.type, vehicle.price);
    
    return {
      vehicleId,
      vehicleType: vehicle.type,
      vehiclePrice: Number(vehicle.price),
      feePercentage: percentage,
      platformFee: fee,
      currency: 'BDT',
    };
  }

  /**
   * SSLCommerz IPN callback (called by SSLCommerz after payment)
   */
  @Post('sslcommerz/ipn')
  @HttpCode(HttpStatus.OK)
  async handleSSLCommerzIpn(@Body() ipnData: SSLCommerzIpnDto) {
    this.logger.log(`Received SSLCommerz IPN: ${JSON.stringify(ipnData)}`);
    return this.paymentsService.handleSSLCommerzIpn(ipnData);
  }

  /**
   * SSLCommerz success redirect
   */
  @Post('sslcommerz/success')
  @HttpCode(HttpStatus.OK)
  async handleSSLCommerzSuccess(@Body() data: any) {
    this.logger.log(`SSLCommerz Success: ${JSON.stringify(data)}`);
    if (data.tran_id) {
      const payment = await this.paymentsService.findByTransactionId(data.tran_id);
      if (payment && payment.status !== PaymentStatus.PAID) {
        await this.paymentsService.handleSSLCommerzIpn({
          ...data,
          status: 'VALID',
        });
      }
    }
    return { success: true, message: 'Payment successful' };
  }

  /**
   * SSLCommerz failure redirect
   */
  @Post('sslcommerz/fail')
  @HttpCode(HttpStatus.OK)
  async handleSSLCommerzFail(@Body() data: any) {
    this.logger.log(`SSLCommerz Failed: ${JSON.stringify(data)}`);
    if (data.tran_id) {
      await this.paymentsService.handleSSLCommerzIpn({
        ...data,
        status: 'FAILED',
      });
    }
    return { success: false, message: 'Payment failed' };
  }

  /**
   * SSLCommerz cancel redirect
   */
  @Post('sslcommerz/cancel')
  @HttpCode(HttpStatus.OK)
  async handleSSLCommerzCancel(@Body() data: any) {
    this.logger.log(`SSLCommerz Cancelled: ${JSON.stringify(data)}`);
    if (data.tran_id) {
      await this.paymentsService.handleSSLCommerzIpn({
        ...data,
        status: 'CANCELLED',
      });
    }
    return { success: false, message: 'Payment cancelled' };
  }

  /**
   * Confirm payment manually (admin action)
   */
  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async confirmPayment(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.confirmPayment(id);
  }

  /**
   * Get payment by vehicle ID
   */
  @Get('vehicle/:vehicleId')
  @UseGuards(JwtAuthGuard)
  async getPaymentByVehicle(@Param('vehicleId', ParseIntPipe) vehicleId: number) {
    return this.paymentsService.findByVehicle(vehicleId);
  }

  /**
   * Get payment by transaction ID
   */
  @Get('transaction/:transactionId')
  @UseGuards(JwtAuthGuard)
  async getPaymentByTransaction(@Param('transactionId') transactionId: string) {
    return this.paymentsService.findByTransactionId(transactionId);
  }

  /**
   * Get all payments (admin only)
   */
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll(@Query('status') status?: PaymentStatus) {
    return this.paymentsService.findAll(status);
  }

  /**
   * Get payment statistics (admin only)
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }

  /**
   * Get pending payments (admin only) - includes failed payments
   */
  @Get('pending')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getPendingPayments() {
    return this.paymentsService.getPendingPayments();
  }

  /**
   * Get paid payments (admin only)
   */
  @Get('paid')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getPaidPayments() {
    return this.paymentsService.getPaidPayments();
  }
}

