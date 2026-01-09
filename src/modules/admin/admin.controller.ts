import { Controller, Get, Post, Delete, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('vehicles/pending')
  async getPendingVehicles() {
    return this.adminService.getPendingVehicles();
  }

  @Get('vehicles/sold')
  async getSoldVehicles() {
    return this.adminService.getSoldVehicles();
  }

  @Post('vehicles/:id/approve')
  async approveVehicle(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveVehicle(id);
  }

  @Post('vehicles/:id/reject')
  async rejectVehicle(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.rejectVehicle(id);
  }

  @Get('vehicles')
  async getAllVehicles() {
    return this.adminService.getPendingVehicles();
  }

  // User management endpoints
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }
}

