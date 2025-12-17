import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';  // ✅ ADD THIS

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    VehiclesModule,  // ✅ ADD THIS - makes VehiclesService available
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
})
export class AdminModule {}