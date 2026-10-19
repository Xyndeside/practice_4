import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, Matches, Max, Min, MinLength } from 'class-validator';
import { ADMIN_STATUSES, PAYMENT_METHODS } from '../constants';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt({ message: 'Выберите помещение' })
  roomId: number;

  @IsNotEmpty({ message: 'Укажите дату начала' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Дата в формате ГГГГ-ММ-ДД' })
  startDate: string;

  @IsIn(PAYMENT_METHODS as unknown as string[], { message: 'Выберите способ оплаты' })
  paymentMethod: string;
}

export class CreateReviewDto {
  @Type(() => Number)
  @IsInt({ message: 'Поставьте оценку от 1 до 5' })
  @Min(1, { message: 'Поставьте оценку от 1 до 5' })
  @Max(5, { message: 'Поставьте оценку от 1 до 5' })
  rating: number;

  @IsNotEmpty({ message: 'Напишите отзыв' })
  @MinLength(5, { message: 'Отзыв слишком короткий' })
  text: string;
}

export class ChangeStatusDto {
  @IsIn(ADMIN_STATUSES, { message: 'Недопустимый статус' })
  status: string;
}
