import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserFactory } from './factories/user.factory';
import { VehicleFactory } from './factories/vehicle.factory';
import { PaymentFactory } from './factories/payment.factory';
import { FavoriteFactory } from './factories/favorite.factory';
import { User } from '../modules/users/entities/user.entity';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { Favorite } from '../modules/favorites/entities/favorite.entity';

const logger = new Logger('Seeder');

export async function runSeed(dataSource: DataSource) {
  logger.log('🌱 Starting database seeding...');

  const userRepository = dataSource.getRepository(User);
  const vehicleRepository = dataSource.getRepository(Vehicle);
  const paymentRepository = dataSource.getRepository(Payment);
  const favoriteRepository = dataSource.getRepository(Favorite);

  try {
    // Clear existing data (optional - comment out if you want to keep data)
    // logger.log('Clearing existing data...');
    // await favoriteRepository.delete({});
    // await paymentRepository.delete({});
    // await vehicleRepository.delete({});
    // await userRepository.delete({});

    // Seed Users (25 users)
    logger.log('👥 Seeding 25 users...');
    const usersData = await UserFactory.createMany(25);
    const savedUsers = await userRepository.save(usersData);
    logger.log(`✅ Created ${savedUsers.length} users`);

    // Seed Vehicles (150 vehicles)
    logger.log('🚗 Seeding 150 vehicles...');
    const vehiclesData = VehicleFactory.createMany(150, savedUsers);
    const savedVehicles = await vehicleRepository.save(vehiclesData);
    logger.log(`✅ Created ${savedVehicles.length} vehicles`);

    // Seed Payments (75 payments for some vehicles)
    logger.log('💳 Seeding 75 payments...');
    const paymentsData = PaymentFactory.createMany(75, savedVehicles);
    const savedPayments = await paymentRepository.save(paymentsData);
    logger.log(`✅ Created ${savedPayments.length} payments`);

    // Seed Favorites (100 favorites)
    logger.log('❤️ Seeding 100 favorites...');
    const favoritesData = FavoriteFactory.createMany(100, savedUsers, savedVehicles);
    const savedFavorites = await favoriteRepository.save(favoritesData);
    logger.log(`✅ Created ${savedFavorites.length} favorites`);

    // Summary
    logger.log('✨ Database seeding completed successfully!');
    logger.log(`📊 Total records seeded: ${savedUsers.length + savedVehicles.length + savedPayments.length + savedFavorites.length}`);
    logger.log(`   - Users: ${savedUsers.length}`);
    logger.log(`   - Vehicles: ${savedVehicles.length}`);
    logger.log(`   - Payments: ${savedPayments.length}`);
    logger.log(`   - Favorites: ${savedFavorites.length}`);

    return true;
  } catch (error) {
    logger.error('❌ Error during seeding:', error);
    throw error;
  }
}
