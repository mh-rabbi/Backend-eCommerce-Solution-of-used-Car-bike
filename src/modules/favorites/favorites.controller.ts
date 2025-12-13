import { Controller, Get, Post, Delete, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  async getUserFavorites(@CurrentUser() user: any) {
    return this.favoritesService.getUserFavorites(user.id);
  }

  @Post(':vehicleId')
  async addToFavorites(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.addToFavorites(user.id, vehicleId);
  }

  @Delete(':vehicleId')
  async removeFromFavorites(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @CurrentUser() user: any,
  ) {
    await this.favoritesService.removeFromFavorites(user.id, vehicleId);
    return { message: 'Removed from favorites' };
  }

  @Get(':vehicleId/check')
  async checkFavorite(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @CurrentUser() user: any,
  ) {
    const isFavorite = await this.favoritesService.isFavorite(user.id, vehicleId);
    return { isFavorite };
  }
}

