import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { STATUS_DONE, STATUS_NEW } from '../constants';
import { Booking, Review, Room } from '../entities';
import { CreateBookingDto, CreateReviewDto } from './bookings.dto';

export interface AdminFilters {
  status?: string;
  roomId?: number;
  q?: string;
}

const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @InjectRepository(Room) private readonly rooms: Repository<Room>,
    @InjectRepository(Review) private readonly reviews: Repository<Review>,
  ) {}

  async create(userId: number, dto: CreateBookingDto) {
    const room = await this.rooms.findOneBy({ id: dto.roomId });
    if (!room) {
      throw new BadRequestException({
        message: 'Ошибка валидации',
        errors: { roomId: 'Такого помещения нет' },
      });
    }
    if (Number.isNaN(Date.parse(dto.startDate)) || dto.startDate < todayIso()) {
      throw new BadRequestException({
        message: 'Ошибка валидации',
        errors: { startDate: 'Дата не может быть в прошлом' },
      });
    }
    const booking = this.bookings.create({
      user: { id: userId } as any,
      room,
      startDate: dto.startDate,
      paymentMethod: dto.paymentMethod as any,
      status: STATUS_NEW,
    });
    const saved = await this.bookings.save(booking);
    return { id: saved.id, status: saved.status };
  }

  listMine(userId: number) {
    return this.bookings.find({
      where: { user: { id: userId } },
      relations: { room: true, review: true },
      order: { createdAt: 'DESC' },
    });
  }

  async addReview(userId: number, bookingId: number, dto: CreateReviewDto) {
    const booking = await this.bookings.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: { review: true },
    });
    if (!booking) throw new NotFoundException({ message: 'Заявка не найдена' });
    if (booking.status !== STATUS_DONE) {
      throw new BadRequestException({
        message: 'Отзыв можно оставить только после завершения мероприятия',
      });
    }
    if (booking.review) {
      throw new ConflictException({ message: 'Вы уже оставили отзыв на это мероприятие' });
    }
    const review = await this.reviews.save(
      this.reviews.create({ booking, rating: dto.rating, text: dto.text.trim() }),
    );
    return { id: review.id, rating: review.rating, text: review.text, createdAt: review.createdAt };
  }

  listAll(filters: AdminFilters) {
    const qb = this.bookings
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.room', 'r')
      .leftJoinAndSelect('b.review', 'rv')
      .leftJoin('b.user', 'u')
      .addSelect(['u.id', 'u.login', 'u.fullName', 'u.phone', 'u.email'])
      .orderBy('b.createdAt', 'DESC');

    if (filters.status) qb.andWhere('b.status = :status', { status: filters.status });
    if (filters.roomId) qb.andWhere('r.id = :roomId', { roomId: filters.roomId });
    if (filters.q) {
      qb.andWhere('(u.fullName ILIKE :q OR u.login ILIKE :q)', { q: `%${filters.q}%` });
    }
    return qb.getMany();
  }

  async setStatus(id: number, status: string) {
    const booking = await this.bookings.findOneBy({ id });
    if (!booking) throw new NotFoundException({ message: 'Заявка не найдена' });
    booking.status = status;
    await this.bookings.save(booking);
    return { id, status };
  }
}
