import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminGuard, AuthGuard } from '../common/guards';
import { ChangeStatusDto, CreateBookingDto, CreateReviewDto } from './bookings.dto';
import { BookingsService } from './bookings.service';

@Controller('api/bookings')
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateBookingDto) {
    return this.service.create(req.session.userId, dto);
  }

  @Get('my')
  mine(@Req() req: Request) {
    return this.service.listMine(req.session.userId);
  }

  @Post(':id/review')
  review(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.service.addReview(req.session.userId, id, dto);
  }
}

@Controller('api/admin/bookings')
@UseGuards(AdminGuard)
export class AdminBookingsController {
  constructor(private readonly service: BookingsService) {}

  @Get()
  list(
    @Query('status') status?: string,
    @Query('roomId') roomId?: string,
    @Query('q') q?: string,
  ) {
    return this.service.listAll({
      status: status || undefined,
      roomId: roomId ? Number(roomId) : undefined,
      q: q?.trim() || undefined,
    });
  }

  @Patch(':id/status')
  status(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangeStatusDto) {
    return this.service.setStatus(id, dto.status);
  }
}
