import { Module } from '@nestjs/common';
import { ReelsService } from './reels.service';
import { ReelsController } from './reels.controller';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Module({
    controllers: [ReelsController],
    providers: [ReelsService, PrismaService, UsersService, ActivityLogsService],
    exports: [ReelsService],
})
export class ReelsModule { }
