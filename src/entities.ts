import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { PaymentMethod, STATUS_NEW } from './constants';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  login: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ name: 'full_name', length: 150 })
  fullName: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 150 })
  email: string;

  @Column({ type: 'varchar', length: 10, default: 'user' })
  role: 'user' | 'admin';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Booking, (b) => b.user)
  bookings: Relation<Booking>[];
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  /** Аудитория | Коворкинг | Кинозал */
  @Column({ length: 30 })
  type: string;

  @Column({ type: 'int' })
  capacity: number;

  @OneToMany(() => Booking, (b) => b.room)
  bookings: Relation<Booking>[];
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.bookings, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => Room, (r) => r.bookings, { nullable: false })
  @JoinColumn({ name: 'room_id' })
  room: Relation<Room>;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 10 })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar', length: 40, default: STATUS_NEW })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => Review, (r) => r.booking)
  review: Relation<Review>;
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Booking, (b) => b.review, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Relation<Booking>;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
