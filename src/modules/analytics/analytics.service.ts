import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { PaymentsService } from '../payments/payments.service';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
    private paymentsService: PaymentsService,
  ) {}

  async getTotalUsers(): Promise<number> {
    return this.usersRepository.count();
  }

  async getTotalVehicles(): Promise<number> {
    return this.vehiclesRepository.count();
  }


async getSoldVehiclesCount(): Promise<number> {
  return this.vehiclesRepository.count({
    where: { status: VehicleStatus.SOLD },  // ✅ Use enum
  });
}

  async getTotalRevenue(): Promise<number> {
    return this.paymentsService.getTotalRevenue();
  }

  async getAnalytics() {
    const [totalUsers, totalVehicles, soldVehicles, revenue, pendingVehicles, approvedVehicles, rejectedVehicles] = await Promise.all([
      this.getTotalUsers(),
      this.getTotalVehicles(),
      this.getSoldVehiclesCount(),
      this.getTotalRevenue(),
      this.vehiclesRepository.count({ where: { status: VehicleStatus.PENDING } }),
      this.vehiclesRepository.count({ where: { status: VehicleStatus.APPROVED } }),
      this.vehiclesRepository.count({ where: { status: VehicleStatus.REJECTED } }),
    ]);

    return {
      totalUsers,
      totalVehicles,
      soldVehicles,
      totalRevenue: revenue || 0,
      pendingVehicles,
      approvedVehicles,
      rejectedVehicles,
    };
  }

  async getVehiclesByBrand() {
    const vehicles = await this.vehiclesRepository.find();
    const brandCount = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.brand] = (acc[vehicle.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(brandCount).map(([brand, count]) => ({
      brand,
      count,
    }));
  }

  async getVehiclesByType() {
    const vehicles = await this.vehiclesRepository.find();
    const typeCount = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
    }));
  }
}

