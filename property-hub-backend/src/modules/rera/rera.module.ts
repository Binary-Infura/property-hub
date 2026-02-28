import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReraService } from './rera.service';
import { ReraController } from './rera.controller';
import { ReraProcessor } from './rera.processor';
import { ReraScheduler } from './rera.scheduler';
import { RajasthanScraper } from './scrapers/rajasthan.scraper';
import { MaharashtraScraper } from './scrapers/maharashtra.scraper';
import { DatabaseModule } from '../../database/database.module';

import { UsersModule } from '../users/users.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
    imports: [
        DatabaseModule,
        UsersModule,
        ActivityLogsModule,
        BullModule.registerQueue({
            name: 'rera-sync',
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
            },
        }),
    ],
    controllers: [ReraController],
    providers: [
        ReraService,
        ReraProcessor,
        ReraScheduler,
        RajasthanScraper,
        MaharashtraScraper,
    ],
    exports: [ReraService],
})
export class ReraModule { }
