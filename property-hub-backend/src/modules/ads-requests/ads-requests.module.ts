import { Module } from '@nestjs/common';
import { AdsRequestsService } from './ads-requests.service';
import { AdsRequestsController } from './ads-requests.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
    controllers: [AdsRequestsController],
    providers: [AdsRequestsService, PrismaService],
    exports: [AdsRequestsService],
})
export class AdsRequestsModule { }
