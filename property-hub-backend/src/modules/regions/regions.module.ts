import { Module } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
    imports: [],
    controllers: [RegionsController],
    providers: [RegionsService, PrismaService],
    exports: [RegionsService],
})
export class RegionsModule { }
