import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiclesService } from '../vehicles/vehicles.service';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    private vehiclesService: VehiclesService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getPendingVehicles() {
    return this.vehiclesService.findAll(VehicleStatus.PENDING);
  }

  async approveVehicle(id: number) {
    return this.vehiclesService.updateStatus(id, VehicleStatus.APPROVED);
  }

  async rejectVehicle(id: number) {
    return this.vehiclesService.updateStatus(id, VehicleStatus.REJECTED);
  }

  async getSoldVehicles() {
    return this.vehiclesService.findAll(VehicleStatus.SOLD);
  }

  // User management methods
  async getAllUsers() {
    const users = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'role', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
    return users;
  }

  async getUserById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'createdAt'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async deleteUser(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.remove(user);
    return { message: 'User deleted successfully' };
  }
}

