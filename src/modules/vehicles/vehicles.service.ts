import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, VehicleStatus } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) { }

  async create(createVehicleDto: CreateVehicleDto, sellerId: number): Promise<Vehicle> {
    // Sanitize image URLs to ensure they are relative paths
    if (createVehicleDto.images) {
      createVehicleDto.images = createVehicleDto.images.map(url => {
        // If it's a full URL (starts with http), extract just the path
        if (typeof url === 'string' && url.startsWith('http')) {
          try {
            const urlObj = new URL(url);
            // Return only the pathname (e.g., /uploads/image.jpg)
            return urlObj.pathname;
          } catch (e) {
            console.warn('Failed to parse image URL:', url);
            return url;
          }
        }
        return url;
      });
    }

    const vehicle = this.vehiclesRepository.create({
      ...createVehicleDto,
      sellerId,
      status: VehicleStatus.PENDING,
    });
    return this.vehiclesRepository.save(vehicle);
  }

  async findAll(status?: VehicleStatus): Promise<Vehicle[]> {
    const where = status ? { status } : {};
    return this.vehiclesRepository.find({
      where,
      relations: ['seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async findBySeller(sellerId: number): Promise<Vehicle[]> {
    return this.vehiclesRepository.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, status: VehicleStatus): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    vehicle.status = status;
    return this.vehiclesRepository.save(vehicle);
  }

  async markAsSold(id: number, sellerId: number): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    if (vehicle.sellerId !== sellerId) {
      throw new ForbiddenException('You can only mark your own vehicles as sold');
    }
    vehicle.status = VehicleStatus.SOLD;
    return this.vehiclesRepository.save(vehicle);
  }

  async getApprovedVehicles(): Promise<Vehicle[]> {
    return this.vehiclesRepository.find({
      where: { status: VehicleStatus.APPROVED },
      relations: ['seller'],
      order: { createdAt: 'DESC' },
    });
  }
}

