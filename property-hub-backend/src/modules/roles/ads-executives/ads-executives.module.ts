import { Module } from '@nestjs/common';
import { AdsExecutivesService } from './ads-executives.service';
import { AdsExecutivesController } from './ads-executives.controller';
import { PrismaService } from '../../../database/prisma.service';

@Module({
    controllers: [AdsExecutivesController],
    providers: [AdsExecutivesService, PrismaService],
    exports: [AdsExecutivesService],
})
export class AdsExecutivesModule { }
