import { Injectable } from '@nestjs/common';
import { VehiclesService } from '../vehicles/vehicles.service';
import { VehicleStatus } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class AdminService {
  constructor(private vehiclesService: VehiclesService) {}

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
}

