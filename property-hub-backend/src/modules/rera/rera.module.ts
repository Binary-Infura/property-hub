import { Module } from '@nestjs/common';
import { ReraService } from './rera.service';
import { ReraController } from './rera.controller';
import { PrismaService } from 'src/database/prisma.service';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
    imports: [
        DatabaseModule,
        UsersModule,
        ActivityLogsModule,
    ],
    controllers: [ReraController],
    providers: [ReraService, PrismaService],
    exports: [ReraService],
})
export class ReraModule { }
