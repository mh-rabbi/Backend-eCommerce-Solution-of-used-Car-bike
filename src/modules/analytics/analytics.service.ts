import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
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
    // Calculate dates for MoM (Month over Month)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Helper to calculate percentage growth
    const calculateGrowth = (current: number, last: number) => {
      if (last === 0) return current > 0 ? 100 : 0;
      return ((current - last) / last) * 100;
    };

    // 1. Revenue and Revenue Growth
    const [currentMonthRevenue, lastMonthRevenue, avgMargin] = await Promise.all([
      this.paymentsService.getRevenueByDateRange(currentMonthStart, now),
      this.paymentsService.getRevenueByDateRange(lastMonthStart, lastMonthEnd),
      this.paymentsService.getAverageFeePercentage(),
    ]);

    // 2. Vehicles Sold Growth
    const [currentMonthSold, lastMonthSold] = await Promise.all([
      this.vehiclesRepository.count({
        where: {
          status: VehicleStatus.SOLD,
          createdAt: MoreThanOrEqual(currentMonthStart)
        } as any
      }),
      this.vehiclesRepository.count({
        where: {
          status: VehicleStatus.SOLD,
          createdAt: Between(lastMonthStart, lastMonthEnd)
        } as any
      })
    ]);

    // 3. Active Listings Growth (Approved vehicles)
    const [currentMonthApproved, lastMonthApproved] = await Promise.all([
      this.vehiclesRepository.count({
        where: {
          status: VehicleStatus.APPROVED,
          createdAt: MoreThanOrEqual(currentMonthStart)
        } as any
      }),
      this.vehiclesRepository.count({
        where: {
          status: VehicleStatus.APPROVED,
          createdAt: Between(lastMonthStart, lastMonthEnd)
        } as any
      })
    ]);

    // 4. Conversion Rate Growth
    // We compare conversion rate of THIS month vs conversion rate of LAST month
    const [currentMonthTotal, lastMonthTotal] = await Promise.all([
      this.vehiclesRepository.count({ where: { createdAt: MoreThanOrEqual(currentMonthStart) } as any }),
      this.vehiclesRepository.count({ where: { createdAt: Between(lastMonthStart, lastMonthEnd) } as any })
    ]);

    const currentConvRate = currentMonthTotal > 0 ? (currentMonthSold / currentMonthTotal) : 0;
    const lastConvRate = lastMonthTotal > 0 ? (lastMonthSold / lastMonthTotal) : 0;

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
      platformFeeCollected: revenue || 0,
      revenueGrowth: Math.round(calculateGrowth(currentMonthRevenue, lastMonthRevenue) * 10) / 10,
      vehiclesSoldGrowth: Math.round(calculateGrowth(currentMonthSold, lastMonthSold) * 10) / 10,
      activeListingsGrowth: Math.round(calculateGrowth(currentMonthApproved, lastMonthApproved) * 10) / 10,
      conversionRateGrowth: Math.round(calculateGrowth(currentConvRate, lastConvRate) * 10) / 10,
      avgMargin: Math.round(avgMargin * 100) / 100,
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

