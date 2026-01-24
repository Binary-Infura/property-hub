import { Module } from '@nestjs/common';
import { CommissionManagersService } from './commission-managers.service';
import { CommissionManagersController } from './commission-managers.controller';
import { PrismaService } from '../../database/prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [CommissionManagersController],
    providers: [CommissionManagersService, PrismaService],
})
export class CommissionManagersModule { }
