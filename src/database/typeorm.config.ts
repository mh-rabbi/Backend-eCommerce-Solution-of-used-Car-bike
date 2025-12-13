import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { Favorite } from '../modules/favorites/entities/favorite.entity';
import { Payment } from '../modules/payments/entities/payment.entity';

export const DatabaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root_rabbi',
  password: process.env.DB_PASSWORD || 'Rabbi@1234',
  database: process.env.DB_DATABASE || 'vehicle_marketplace',
  entities: [User, Vehicle, Favorite, Payment],
  synchronize: true, // Set to false in production, use migrations instead
  logging: false,
};

