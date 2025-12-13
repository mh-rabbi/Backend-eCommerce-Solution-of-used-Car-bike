import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics() {
    return this.analyticsService.getAnalytics();
  }

  @Get('brands')
  async getVehiclesByBrand() {
    return this.analyticsService.getVehiclesByBrand();
  }

  @Get('types')
  async getVehiclesByType() {
    return this.analyticsService.getVehiclesByType();
  }
}

