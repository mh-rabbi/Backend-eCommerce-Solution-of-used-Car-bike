import { faker } from '@faker-js/faker';
import { Favorite } from '../../modules/favorites/entities/favorite.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Vehicle } from '../../modules/vehicles/entities/vehicle.entity';

export class FavoriteFactory {
  static create(user: User, vehicle: Vehicle, favoriteData?: Partial<Favorite>): Favorite {
    const favorite = new Favorite();

    favorite.userId = user.id;
    favorite.user = user;
    favorite.vehicleId = vehicle.id;
    favorite.vehicle = vehicle;

    return favorite;
  }

  static createMany(count: number, users: User[], vehicles: Vehicle[], favoriteData?: Partial<Favorite>): Favorite[] {
    const favorites: Favorite[] = [];
    const usedPairs = new Set<string>();

    for (let i = 0; i < count; i++) {
      let user: User;
      let vehicle: Vehicle;
      let pairKey: string;

      // Ensure unique user-vehicle combinations
      do {
        user = faker.helpers.arrayElement(users);
        vehicle = faker.helpers.arrayElement(vehicles);
        pairKey = `${user.id}-${vehicle.id}`;
      } while (usedPairs.has(pairKey) && usedPairs.size < users.length * vehicles.length);

      if (!usedPairs.has(pairKey)) {
        usedPairs.add(pairKey);
        favorites.push(this.create(user, vehicle, favoriteData));
      }
    }

    return favorites;
  }
}
