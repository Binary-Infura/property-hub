import { Module } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
    controllers: [CommissionsController],
    providers: [CommissionsService, PrismaService],
})
export class CommissionsModule { }
