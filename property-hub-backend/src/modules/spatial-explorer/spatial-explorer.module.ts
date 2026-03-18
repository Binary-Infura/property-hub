import { Module } from '@nestjs/common';
import { SpatialExplorerController } from './spatial-explorer.controller';
import { SpatialExplorerService } from './spatial-explorer.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
    controllers: [SpatialExplorerController],
    providers: [SpatialExplorerService, PrismaService],
    exports: [SpatialExplorerService]
})
export class SpatialExplorerModule {}
