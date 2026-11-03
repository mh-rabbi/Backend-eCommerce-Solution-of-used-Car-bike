# Database Seeder Documentation

## Overview
This seeder populates your database with realistic test data for all four main entities:
- **Users**: 25 users with various roles (admin/user)
- **Vehicles**: 150 vehicles (cars and bikes) with realistic details
- **Payments**: 75 payment records with different statuses
- **Favorites**: 100 favorite entries (user-vehicle combinations)

**Total Records**: ~350

## Files Structure
```
src/seeds/
├── factories/
│   ├── user.factory.ts      # User data factory
│   ├── vehicle.factory.ts   # Vehicle data factory
│   ├── payment.factory.ts   # Payment data factory
│   ├── favorite.factory.ts  # Favorite data factory
│   └── index.ts            # Factory exports
├── seed.ts                  # Main seeding logic
├── run-seed.ts             # Seeder entry point
└── README.md               # This file
```

## Prerequisites
- Node.js and npm installed
- MySQL/MariaDB running and accessible
- `.env` file configured with database credentials:
  ```
  DB_HOST=localhost
  DB_PORT=3306
  DB_USERNAME=root
  DB_PASSWORD=Rabbi@1234
  DB_DATABASE=vehicle_marketplace
  ```

## Installation
Dependencies are already included:
- `@faker-js/faker` - For generating realistic fake data
- All NestJS and TypeORM packages

## Usage

### Run the Seeder
```bash
npm run seed
```

This will:
1. Connect to your database using `.env` credentials
2. Create 25 users
3. Create 150 vehicles assigned to random users
4. Create 75 payments for random vehicles
5. Create 100 favorites linking users to vehicles
6. Display completion summary

### Alternative: Build and Run
```bash
npm run seed:build
```

This builds the project first, then runs the compiled seeder.

## Data Details

### Users
- Random names, emails, addresses
- Hashed passwords
- Phone numbers in Bangladesh format (01#-#####-####)
- Profile images from Faker
- ~10% chance of being ADMIN role

### Vehicles
- Random brand (Toyota, Honda, Suzuki, BMW for cars; Honda, Yamaha, Bajaj for bikes)
- Mix of cars (~50%) and bikes (~50%)
- Prices ranging from 500,000 to 5,000,000
- 3 vehicle images each (from Pexels)
- Various statuses (pending, approved, rejected, sold)

### Payments
- Linked to random vehicles
- Amount = vehicle price + fee (2-5%)
- Payment methods: SSLCommerz or bKash
- Various statuses (pending, paid, failed)
- Transaction IDs (UUID format)

### Favorites
- Unique user-vehicle combinations
- Prevents duplicate favorites
- Links users to their favorite vehicles

## Customization

### Change Number of Records
Edit `src/seeds/seed.ts`:

```typescript
// Line ~40s - Change these numbers
const usersData = await Promise.all(
  Array.from({ length: 25 }).map(() => UserFactory.create())
);

const vehiclesData = VehicleFactory.createMany(150, savedUsers);
const paymentsData = PaymentFactory.createMany(75, savedVehicles);
const favoritesData = FavoriteFactory.createMany(100, savedUsers, savedVehicles);
```

### Clear Data First
Uncomment in `src/seeds/seed.ts` (lines ~27-31):

```typescript
logger.log('Clearing existing data...');
await favoriteRepository.delete({});
await paymentRepository.delete({});
await vehicleRepository.delete({});
await userRepository.delete({});
```

## Troubleshooting

### Database Connection Error
Ensure your `.env` file has correct credentials:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=Rabbi@1234
DB_DATABASE=vehicle_marketplace
```

### Permission Denied Error
If you get "Access denied for user 'root'", verify:
- MySQL is running
- Credentials in `.env` are correct
- User 'root' has proper permissions

### TypeScript Compilation Error
Ensure you have `ts-node` installed:
```bash
npm install --save-dev ts-node
```

## Notes
- Seeder uses transactions where possible for data integrity
- All relationships (seller-vehicle, vehicle-payment) are properly linked
- Favorite constraints are respected (unique user-vehicle pairs)
- Images are sourced from Pexels (free stock photos)
- All data is randomly generated and fictional
