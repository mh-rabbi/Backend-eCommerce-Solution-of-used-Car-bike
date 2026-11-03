import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import { runSeed } from './seed';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'Rabbi@1234',
  database: process.env.DB_DATABASE || 'vehicle_marketplace',
  entities: ['src/modules/**/entities/*.entity.ts'],
  synchronize: true,
  logging: false,
});

AppDataSource.initialize()
  .then(async (dataSource) => {
    console.log('✅ Database connection established');
    await runSeed(dataSource);
    await dataSource.destroy();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  });
