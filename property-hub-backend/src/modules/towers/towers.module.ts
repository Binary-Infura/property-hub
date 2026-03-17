import { Module } from '@nestjs/common';
import { TowersService } from './towers.service';
import { TowersController } from './towers.controller';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
    imports: [DatabaseModule, UsersModule, ActivityLogsModule],
    controllers: [TowersController],
    providers: [TowersService],
    exports: [TowersService],
})
export class TowersModule { }
