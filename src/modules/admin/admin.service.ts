import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiclesService } from '../vehicles/vehicles.service';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';
import { VehiclesGateway } from '../vehicles/vehicles.gateway';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    private vehiclesService: VehiclesService,
    private vehiclesGateway: VehiclesGateway,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async getPendingVehicles() {
    return this.vehiclesService.findAll(VehicleStatus.PENDING);
  }

  async approveVehicle(id: number) {
    const vehicle = await this.vehiclesService.updateStatus(id, VehicleStatus.APPROVED);

    // Emit real-time update to all connected clients
    this.vehiclesGateway.emitVehicleApproved(vehicle);

    return vehicle;
  }

  async rejectVehicle(id: number) {
    const vehicle = await this.vehiclesService.updateStatus(id, VehicleStatus.REJECTED);

    // Emit real-time update to all connected clients
    this.vehiclesGateway.emitVehicleRejected(id);

    return vehicle;
  }

  async getSoldVehicles() {
    return this.vehiclesService.findAll(VehicleStatus.SOLD);
  }

  // User management methods
  async getAllUsers() {
    const users = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'role', 'profileImage', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
    return users;
  }

  async getUserById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'profileImage', 'phone', 'address', 'streetNo', 'postalCode', 'createdAt'],
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

