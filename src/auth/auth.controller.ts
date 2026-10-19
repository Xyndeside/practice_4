import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../entities';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

const publicUser = (u: User) => ({
  id: u.id,
  login: u.login,
  fullName: u.fullName,
  phone: u.phone,
  email: u.email,
  role: u.role,
});

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.auth.register(dto);
    return { ok: true, user: publicUser(user) };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const user = await this.auth.login(dto);
    req.session.userId = user.id;
    req.session.role = user.role;
    return { ok: true, user: publicUser(user) };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: Request) {
    return new Promise((resolve) => req.session.destroy(() => resolve({ ok: true })));
  }

  @Get('me')
  async me(@Req() req: Request) {
    if (!req.session.userId) return { user: null };
    const user = await this.auth.findById(req.session.userId);
    return { user: user ? publicUser(user) : null };
  }
}
