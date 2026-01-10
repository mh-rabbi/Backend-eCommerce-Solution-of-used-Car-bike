import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { VehicleType } from '../vehicles/entities/vehicle.entity';
import { InitializePaymentDto, SSLCommerzIpnDto } from './dto/payment.dto';

// Platform fee percentages
const PLATFORM_FEE = {
  CAR: 0.08,  // 8% for cars
  BIKE: 0.05, // 5% for bikes
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private vehiclesService: VehiclesService,
  ) {}

  /**
   * Calculate platform fee based on vehicle type
   */
  calculatePlatformFee(vehicleType: VehicleType, price: number): { fee: number; percentage: number } {
    const percentage = vehicleType === VehicleType.CAR ? PLATFORM_FEE.CAR : PLATFORM_FEE.BIKE;
    const fee = Number(price) * percentage;
    return { fee: Math.round(fee * 100) / 100, percentage: percentage * 100 };
  }

  /**
   * Initialize payment for a vehicle post
   */
  async initializePayment(vehicleId: number, paymentMethod?: PaymentMethod): Promise<Payment> {
    this.logger.log(`Initializing payment for vehicle ID: ${vehicleId}`);
    
    const vehicle = await this.vehiclesService.findOne(vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check if payment already exists for this vehicle
    const existingPayment = await this.paymentsRepository.findOne({
      where: { vehicleId },
    });

    if (existingPayment) {
      this.logger.log(`Existing payment found for vehicle ID: ${vehicleId}`);
      return existingPayment;
    }

    // Calculate platform fee
    const { fee, percentage } = this.calculatePlatformFee(vehicle.type, vehicle.price);
    
    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${vehicleId}`;

    const payment = this.paymentsRepository.create({
      vehicleId,
      amount: fee,
      vehiclePrice: vehicle.price,
      feePercentage: percentage,
      status: PaymentStatus.PENDING,
      paymentMethod: paymentMethod || PaymentMethod.SSLCOMMERZ,
      transactionId,
    });

    const savedPayment = await this.paymentsRepository.save(payment);
    this.logger.log(`Payment initialized: ${savedPayment.id}, Amount: ${fee}, TxnID: ${transactionId}`);
    
    return savedPayment;
  }

  /**
   * Handle SSLCommerz IPN callback
   */
  async handleSSLCommerzIpn(ipnData: SSLCommerzIpnDto): Promise<Payment> {
    this.logger.log(`Processing SSLCommerz IPN: ${JSON.stringify(ipnData)}`);

    const payment = await this.paymentsRepository.findOne({
      where: { transactionId: ipnData.tran_id },
    });

    if (!payment) {
      this.logger.error(`Payment not found for transaction ID: ${ipnData.tran_id}`);
      throw new NotFoundException('Payment not found');
    }

    // Update payment based on SSLCommerz status
    if (ipnData.status === 'VALID' || ipnData.status === 'VALIDATED') {
      payment.status = PaymentStatus.PAID;
      payment.sslTransactionId = ipnData.val_id;
      payment.cardType = ipnData.card_type;
      payment.bankTransactionId = ipnData.bank_tran_id;
      this.logger.log(`Payment marked as PAID: ${payment.id}`);
    } else if (ipnData.status === 'FAILED' || ipnData.status === 'CANCELLED') {
      payment.status = PaymentStatus.FAILED;
      this.logger.log(`Payment marked as FAILED: ${payment.id}`);
    }

    return this.paymentsRepository.save(payment);
  }

  /**
   * Confirm payment manually (for admin or direct confirmation)
   */
  async confirmPayment(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    payment.status = PaymentStatus.PAID;
    this.logger.log(`Payment manually confirmed: ${id}`);
    return this.paymentsRepository.save(payment);
  }

  /**
   * Mark payment as failed
   */
  async markPaymentFailed(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    payment.status = PaymentStatus.FAILED;
    this.logger.log(`Payment marked as failed: ${id}`);
    return this.paymentsRepository.save(payment);
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['vehicle', 'vehicle.seller'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async findByVehicle(vehicleId: number): Promise<Payment | null> {
    return this.paymentsRepository.findOne({
      where: { vehicleId },
      relations: ['vehicle', 'vehicle.seller'],
    });
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({
      where: { transactionId },
      relations: ['vehicle', 'vehicle.seller'],
    });
  }

  async findAll(status?: PaymentStatus): Promise<Payment[]> {
    const where = status ? { status } : {};
    return this.paymentsRepository.find({
      where,
      relations: ['vehicle', 'vehicle.seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingPayments(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: [
        { status: PaymentStatus.PENDING },
        { status: PaymentStatus.FAILED },
      ],
      relations: ['vehicle', 'vehicle.seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPaidPayments(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { status: PaymentStatus.PAID },
      relations: ['vehicle', 'vehicle.seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .getRawOne();
    
    return Number(result?.total) || 0;
  }

  async getPaymentStats(): Promise<{
    totalRevenue: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
  }> {
    const [paidPayments, pendingPayments, failedPayments] = await Promise.all([
      this.paymentsRepository.count({ where: { status: PaymentStatus.PAID } }),
      this.paymentsRepository.count({ where: { status: PaymentStatus.PENDING } }),
      this.paymentsRepository.count({ where: { status: PaymentStatus.FAILED } }),
    ]);

    const totalRevenue = await this.getTotalRevenue();

    return {
      totalRevenue,
      paidCount: paidPayments,
      pendingCount: pendingPayments,
      failedCount: failedPayments,
    };
  }
}

