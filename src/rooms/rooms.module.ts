import { Controller, Get, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../entities';

@Controller('api/rooms')
export class RoomsController {
  constructor(@InjectRepository(Room) private readonly rooms: Repository<Room>) {}

  @Get()
  list() {
    return this.rooms.find({ order: { type: 'ASC', name: 'ASC' } });
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Room])],
  controllers: [RoomsController],
})
export class RoomsModule {}
