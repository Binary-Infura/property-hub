import { Module } from '@nestjs/common';
import { ExotelService } from './exotel.service';
import { ExotelController } from './exotel.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
    controllers: [ExotelController],
    providers: [ExotelService, PrismaService],
    exports: [ExotelService],
})
export class ExotelModule { }
