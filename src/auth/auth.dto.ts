import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Обязательное поле' })
  @Matches(/^[A-Za-z0-9]{6,}$/, {
    message: 'Логин: латиница и цифры, не менее 6 символов',
  })
  login: string;

  @IsNotEmpty({ message: 'Обязательное поле' })
  @MinLength(8, { message: 'Пароль: не менее 8 символов' })
  password: string;

  @IsNotEmpty({ message: 'Обязательное поле' })
  @Matches(/^[А-Яа-яЁё]+(?:\s+[А-Яа-яЁё]+)*$/, {
    message: 'ФИО: только кириллица и пробелы',
  })
  fullName: string;

  @IsNotEmpty({ message: 'Обязательное поле' })
  @Matches(/^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/, {
    message: 'Телефон в формате 8(XXX)XXX-XX-XX',
  })
  phone: string;

  @IsNotEmpty({ message: 'Обязательное поле' })
  @IsEmail({}, { message: 'Введите корректный адрес почты' })
  email: string;
}

export class LoginDto {
  @IsNotEmpty({ message: 'Введите логин' })
  login: string;

  @IsNotEmpty({ message: 'Введите пароль' })
  password: string;
}
