import { Module } from '@nestjs/common';
import { MarketingLeadsService } from './marketing-leads.service';
import { MarketingLeadsController } from './marketing-leads.controller';
import { PrismaService } from '../../../database/prisma.service';

@Module({
    controllers: [MarketingLeadsController],
    providers: [MarketingLeadsService, PrismaService],
    exports: [MarketingLeadsService],
})
export class MarketingLeadsModule { }
