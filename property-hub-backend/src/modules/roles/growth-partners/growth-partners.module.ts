import { Module } from '@nestjs/common';
import { GrowthPartnersService } from './growth-partners.service';
import { GrowthPartnersController } from './growth-partners.controller';
import { PrismaService } from '../../../database/prisma.service';
import { UsersModule } from '../../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [GrowthPartnersController],
    providers: [GrowthPartnersService, PrismaService],
})
export class GrowthPartnersModule { }
