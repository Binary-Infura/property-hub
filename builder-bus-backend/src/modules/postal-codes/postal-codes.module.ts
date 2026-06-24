import { Module } from '@nestjs/common';
import { PostalCodesService } from './postal-codes.service';
import { PostalCodesController } from './postal-codes.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
    providers: [PostalCodesService, PrismaService],
    controllers: [PostalCodesController],
    exports: [PostalCodesService],
})
export class PostalCodesModule { }
