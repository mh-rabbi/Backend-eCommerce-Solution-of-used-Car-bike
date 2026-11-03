import { faker } from '@faker-js/faker';
import { Payment, PaymentStatus, PaymentMethod } from '../../modules/payments/entities/payment.entity';
import { Vehicle } from '../../modules/vehicles/entities/vehicle.entity';

export class PaymentFactory {
  static create(vehicle: Vehicle, paymentData?: Partial<Payment>): Payment {
    const payment = new Payment();
    const feePercentage = parseFloat((Math.random() * 3 + 2).toFixed(2));
    const vehiclePrice = typeof vehicle.price === 'string' ? parseFloat(vehicle.price) : vehicle.price;
    const fee = vehiclePrice * (feePercentage / 100);

    payment.vehicleId = vehicle.id;
    payment.vehicle = vehicle;
    payment.vehiclePrice = paymentData?.vehiclePrice || vehiclePrice;
    payment.feePercentage = paymentData?.feePercentage || feePercentage;
    payment.amount = paymentData?.amount || (vehiclePrice + fee);
    payment.status = paymentData?.status || faker.helpers.arrayElement(Object.values(PaymentStatus));
    payment.paymentMethod = paymentData?.paymentMethod || faker.helpers.arrayElement(Object.values(PaymentMethod));
    payment.transactionId = paymentData?.transactionId || faker.string.uuid();
    payment.sslTransactionId = paymentData?.sslTransactionId || (Math.random() > 0.5 ? faker.string.alphanumeric(20).toUpperCase() : null);
    payment.bankTransactionId = paymentData?.bankTransactionId || (Math.random() > 0.6 ? faker.string.alphanumeric(15).toUpperCase() : null);
    payment.cardType = paymentData?.cardType || faker.helpers.arrayElement(['Visa', 'MasterCard', 'Amex', null]);

    return payment;
  }

  static createMany(count: number, vehicles: Vehicle[], paymentData?: Partial<Payment>): Payment[] {
    const payments: Payment[] = [];
    for (let i = 0; i < count; i++) {
      const randomVehicle = faker.helpers.arrayElement(vehicles);
      payments.push(this.create(randomVehicle, paymentData));
    }
    return payments;
  }
}
