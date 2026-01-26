import { Module } from '@nestjs/common';
import { ConsultantsService } from './consultants.service';
import { ConsultantsController } from './consultants.controller';
import { PrismaService } from '../../../database/prisma.service';

@Module({
    controllers: [ConsultantsController],
    providers: [ConsultantsService, PrismaService],
    exports: [ConsultantsService],
})
export class ConsultantsModule { }
