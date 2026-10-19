import 'dotenv/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'conferences-dev-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errs) => {
        const errors: Record<string, string> = {};
        for (const e of errs) {
          errors[e.property] = Object.values(e.constraints ?? {})[0];
        }
        return new BadRequestException({ message: 'Ошибка валидации', errors });
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'), { extensions: ['html'] });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`Портал «Конференции.РФ»: http://localhost:${port}`);
}
bootstrap();
