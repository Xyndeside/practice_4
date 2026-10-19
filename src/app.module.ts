import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { Booking, Review, Room, User } from './entities';
import { RoomsModule } from './rooms/rooms.module';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 5439),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASS ?? 'postgres',
      database: process.env.DB_NAME ?? 'conferences',
      entities: [User, Room, Booking, Review],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Room]),
    AuthModule,
    RoomsModule,
    BookingsModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
