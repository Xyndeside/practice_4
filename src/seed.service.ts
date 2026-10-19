import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from './constants';
import { Room, User } from './entities';

const ROOMS = [
  { name: 'Аудитория 101', type: 'Аудитория', capacity: 60 },
  { name: 'Лекторий «Большой»', type: 'Аудитория', capacity: 300 },
  { name: 'Коворкинг «Точка»', type: 'Коворкинг', capacity: 40 },
  { name: 'Коворкинг «Лофт»', type: 'Коворкинг', capacity: 25 },
  { name: 'Кинозал «Синема»', type: 'Кинозал', capacity: 150 },
  { name: 'Кинозал «Премьера»', type: 'Кинозал', capacity: 80 },
];

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger('Seed');

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Room) private readonly rooms: Repository<Room>,
  ) {}

  async onModuleInit() {
    if ((await this.rooms.count()) === 0) {
      await this.rooms.save(ROOMS.map((r) => this.rooms.create(r)));
      this.log.log(`Добавлено помещений: ${ROOMS.length}`);
    }
    if (!(await this.users.findOneBy({ login: ADMIN_LOGIN }))) {
      await this.users.save(
        this.users.create({
          login: ADMIN_LOGIN,
          passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
          fullName: 'Администратор портала',
          phone: '8(000)000-00-00',
          email: 'admin@conferences.local',
          role: 'admin',
        }),
      );
      this.log.log('Создан администратор Conf2027');
    }
  }
}
