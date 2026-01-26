import { Module } from '@nestjs/common';
import { PropertyPartnersService } from './property-partners.service';
import { PropertyPartnersController } from './property-partners.controller';
import { PrismaService } from '../../../database/prisma.service';

@Module({
    controllers: [PropertyPartnersController],
    providers: [PropertyPartnersService, PrismaService],
    exports: [PropertyPartnersService],
})
export class PropertyPartnersModule { }
