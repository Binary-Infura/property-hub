import { Module } from '@nestjs/common';
import { RegionAllocationsController } from './region-allocations.controller';
import { RegionAllocationsService } from './region-allocations.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
    controllers: [RegionAllocationsController],
    providers: [RegionAllocationsService, PrismaService],
    exports: [RegionAllocationsService],
})
export class RegionAllocationsModule { }
