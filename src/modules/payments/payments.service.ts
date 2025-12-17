import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private vehiclesService: VehiclesService,
  ) {}

async create(vehicleId: number, amount: number): Promise<Payment> {
  const vehicle = await this.vehiclesService.findOne(vehicleId);
  
  if (vehicle.status !== VehicleStatus.SOLD) {
    throw new BadRequestException('Can only pay for sold vehicles');
  }
  
  const existing = await this.paymentsRepository.findOne({
    where: { vehicleId },
  });

  if (existing) {
    return existing;
  }

  const payment = this.paymentsRepository.create({
    vehicleId,
    amount,
    status: PaymentStatus.PENDING,
  });
  return this.paymentsRepository.save(payment);
}

  async confirmPayment(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    payment.status = PaymentStatus.PAID;
    return this.paymentsRepository.save(payment);
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['vehicle'],
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async findByVehicle(vehicleId: number): Promise<Payment> {
    return this.paymentsRepository.findOne({
      where: { vehicleId },
      relations: ['vehicle'],
    });
  }

  async findAll(status?: PaymentStatus): Promise<Payment[]> {
    const where = status ? { status } : {};
    return this.paymentsRepository.find({
      where,
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTotalRevenue(): Promise<number> {
    const payments = await this.paymentsRepository.find({
      where: { status: PaymentStatus.PAID },
    });
    return payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  }
}

