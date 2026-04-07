import { Module } from '@nestjs/common';
import { LoanPartnersService } from './loan-partners.service';
import { LoanPartnersController } from './loan-partners.controller';
import { PrismaService } from '../../../database/prisma.service';

@Module({
    controllers: [LoanPartnersController],
    providers: [LoanPartnersService, PrismaService],
    exports: [LoanPartnersService],
})
export class LoanPartnersModule { }
