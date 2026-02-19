import { Module } from '@nestjs/common';
import { DsaService } from './dsa.service';
import { DsaController } from './dsa.controller';
import { PrismaService } from '../../../database/prisma.service';

@Module({
    controllers: [DsaController],
    providers: [DsaService, PrismaService],
    exports: [DsaService],
})
export class DsaModule { }
