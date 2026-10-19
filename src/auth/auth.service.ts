import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async register(dto: RegisterDto): Promise<User> {
    const exists = await this.users.findOneBy({ login: dto.login });
    if (exists) {
      throw new ConflictException({
        message: 'Ошибка валидации',
        errors: { login: 'Этот логин уже занят' },
      });
    }
    const user = this.users.create({
      login: dto.login,
      passwordHash: await bcrypt.hash(dto.password, 10),
      fullName: dto.fullName.trim().replace(/\s+/g, ' '),
      phone: dto.phone,
      email: dto.email,
      role: 'user',
    });
    return this.users.save(user);
  }

  async login(dto: LoginDto): Promise<User> {
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.login = :login', { login: dto.login })
      .getOne();

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException({ message: 'Неверный логин или пароль' });
    }
    return user;
  }

  findById(id: number) {
    return this.users.findOneBy({ id });
  }
}
