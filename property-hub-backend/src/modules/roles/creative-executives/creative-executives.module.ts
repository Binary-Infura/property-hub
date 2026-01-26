import { Module } from '@nestjs/common';
import { CreativeExecutivesService } from './creative-executives.service';
import { CreativeExecutivesController } from './creative-executives.controller';
import { PrismaService } from '../../../database/prisma.service';

@Module({
    controllers: [CreativeExecutivesController],
    providers: [CreativeExecutivesService, PrismaService],
    exports: [CreativeExecutivesService],
})
export class CreativeExecutivesModule { }
