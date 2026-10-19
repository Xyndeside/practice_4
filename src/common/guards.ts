import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    if (!req.session?.userId) {
      throw new UnauthorizedException({ message: 'Войдите в систему' });
    }
    return true;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    if (!req.session?.userId) {
      throw new UnauthorizedException({ message: 'Войдите в систему' });
    }
    if (req.session.role !== 'admin') {
      throw new ForbiddenException({ message: 'Доступ только для администратора' });
    }
    return true;
  }
}
