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
  ) { }

  async getTotalUsers(): Promise<number> {
    return this.usersRepository.count();
  }

  async getTotalVehicles(): Promise<number> {
    return this.vehiclesRepository.count();
  }

  async getTopSellers() {
    const topSellers = await this.vehiclesRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.seller', 'seller')
      .select([
        'seller.name as name',
        'COUNT(vehicle.id) as sales',
        'SUM(vehicle.price) as revenue'
      ])
      .where('vehicle.status = :status', { status: VehicleStatus.SOLD })
      .groupBy('seller.id')
      .orderBy('sales', 'DESC')
      .limit(5)
      .getRawMany();

    return topSellers.map(seller => ({
      name: seller.name || 'Unknown',
      sales: Number(seller.sales),
      revenue: Number(seller.revenue)
    }));
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
    // Calculate Growth Rate (Month over Month)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentMonthRevenue, lastMonthRevenue, avgMargin] = await Promise.all([
      this.paymentsService.getRevenueByDateRange(currentMonthStart, currentMonthEnd),
      this.paymentsService.getRevenueByDateRange(lastMonthStart, lastMonthEnd),
      this.paymentsService.getAverageFeePercentage(),
    ]);

    let growthRate = 0;
    if (lastMonthRevenue === 0) {
      growthRate = currentMonthRevenue > 0 ? 100 : 0;
    } else {
      growthRate = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    }

    const [
      totalUsers,
      totalVehicles,
      soldVehicles,
      revenue,
      pendingVehicles,
      approvedVehicles,
      rejectedVehicles,
      paymentStats,
      topSellers,
      monthlyRevenue,
      weeklyRevenue,
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getTotalVehicles(),
      this.getSoldVehiclesCount(),
      this.getTotalRevenue(),
      this.vehiclesRepository.count({ where: { status: VehicleStatus.PENDING } }),
      this.vehiclesRepository.count({ where: { status: VehicleStatus.APPROVED } }),
      this.vehiclesRepository.count({ where: { status: VehicleStatus.REJECTED } }),
      this.paymentsService.getPaymentStats(),
      this.getTopSellers(),
      this.paymentsService.getMonthlyRevenue(now.getFullYear()),
      this.paymentsService.getWeeklyRevenue(),
    ]);

    return {
      totalUsers,
      totalVehicles,
      soldVehicles,
      totalRevenue: revenue || 0,
      platformFeeCollected: revenue || 0, // Platform fee revenue
      growthRate: Math.round(growthRate * 10) / 10, // Round to 1 decimal
      avgMargin: Math.round(avgMargin * 100) / 100, // Round to 2 decimals
      pendingVehicles,
      approvedVehicles,
      rejectedVehicles,
      topSellers,
      payments: {
        paidCount: paymentStats.paidCount,
        pendingCount: paymentStats.pendingCount,
        failedCount: paymentStats.failedCount,
      },
      revenueChartData: {
        monthly: monthlyRevenue,
        weekly: weeklyRevenue,
      },
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

