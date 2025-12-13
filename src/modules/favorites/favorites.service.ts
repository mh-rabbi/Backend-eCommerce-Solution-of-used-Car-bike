import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { VehiclesService } from '../vehicles/vehicles.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    private vehiclesService: VehiclesService,
  ) {}

  async addToFavorites(userId: number, vehicleId: number): Promise<Favorite> {
    // Check if vehicle exists
    await this.vehiclesService.findOne(vehicleId);

    // Check if already favorited
    const existing = await this.favoritesRepository.findOne({
      where: { userId, vehicleId },
    });

    if (existing) {
      throw new ConflictException('Vehicle already in favorites');
    }

    const favorite = this.favoritesRepository.create({ userId, vehicleId });
    return this.favoritesRepository.save(favorite);
  }

  async removeFromFavorites(userId: number, vehicleId: number): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, vehicleId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoritesRepository.remove(favorite);
  }

  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return this.favoritesRepository.find({
      where: { userId },
      relations: ['vehicle', 'vehicle.seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async isFavorite(userId: number, vehicleId: number): Promise<boolean> {
    const favorite = await this.favoritesRepository.findOne({
      where: { userId, vehicleId },
    });
    return !!favorite;
  }
}

