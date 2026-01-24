import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum VehicleType {
  CAR = 'car',
  BIKE = 'bike',
}

export enum VehicleStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SOLD = 'sold',
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sellerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  brand: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  type: VehicleType;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('json', { nullable: true })
  images: string[];

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.PENDING,
  })
  status: VehicleStatus;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Payment, (payment) => payment.vehicle)
  payments: Payment[];
}

