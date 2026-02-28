import { Module } from '@nestjs/common';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { PrismaService } from '../../database/prisma.service';
import { UsersModule } from '../users/users.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
    imports: [UsersModule, ActivityLogsModule],
    controllers: [UnitsController],
    providers: [UnitsService, PrismaService],
    exports: [UnitsService],
})
export class UnitsModule { }
