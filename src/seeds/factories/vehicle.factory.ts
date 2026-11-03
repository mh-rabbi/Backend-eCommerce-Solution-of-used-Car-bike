import { faker } from '@faker-js/faker';
import { Vehicle, VehicleType, VehicleStatus } from '../../modules/vehicles/entities/vehicle.entity';
import { User } from '../../modules/users/entities/user.entity';

export class VehicleFactory {
  static create(seller: User, vehicleData?: Partial<Vehicle>): Vehicle {
    const vehicle = new Vehicle();
    const vehicleType = vehicleData?.type || (Math.random() > 0.5 ? VehicleType.CAR : VehicleType.BIKE);
    const brands = vehicleType === VehicleType.CAR 
      ? ['Toyota', 'Honda', 'Suzuki', 'Hyundai', 'BMW', 'Audi', 'Nissan', 'Mazda']
      : ['Honda', 'Yamaha', 'Bajaj', 'TVS', 'Kawasaki', 'Harley-Davidson', 'Royal Enfield', 'Ducati'];

    const models = {
      car: ['Corolla', 'Civic', 'Swift', 'Elantra', 'X5', 'A4', 'Altima', 'CX-5'],
      bike: ['CB Shine', 'FZ', 'Pulsar', 'Sport', 'Ninja', 'Road Glide', 'Interceptor', 'Monster'],
    };

    const brand = faker.helpers.arrayElement(brands);
    const model = vehicleType === VehicleType.CAR 
      ? faker.helpers.arrayElement(models.car) 
      : faker.helpers.arrayElement(models.bike);

    vehicle.sellerId = seller.id;
    vehicle.seller = seller;
    vehicle.title = `${faker.date.past({ years: 10 }).getFullYear()} ${brand} ${model}`;
    vehicle.description = vehicleData?.description || faker.lorem.paragraphs(2);
    vehicle.brand = vehicleData?.brand || brand;
    vehicle.type = vehicleType;
    vehicle.price = vehicleData?.price || parseFloat(faker.number.int({ min: 500000, max: 5000000 }).toString());
    vehicle.images = vehicleData?.images || [
      `https://images.pexels.com/photos/3803530/pexels-photo-3803530.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`,
      `https://images.pexels.com/photos/3772622/pexels-photo-3772622.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`,
      `https://images.pexels.com/photos/3956060/pexels-photo-3956060.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`,
    ];
    vehicle.status = vehicleData?.status || faker.helpers.arrayElement(Object.values(VehicleStatus));

    return vehicle;
  }

  static createMany(count: number, sellers: User[], vehicleData?: Partial<Vehicle>): Vehicle[] {
    const vehicles: Vehicle[] = [];
    for (let i = 0; i < count; i++) {
      const randomSeller = faker.helpers.arrayElement(sellers);
      vehicles.push(this.create(randomSeller, vehicleData));
    }
    return vehicles;
  }
}
