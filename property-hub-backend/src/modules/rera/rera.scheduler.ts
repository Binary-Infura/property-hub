import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReraService } from './rera.service';

@Injectable()
export class ReraScheduler {
    private readonly logger = new Logger(ReraScheduler.name);

    constructor(private readonly reraService: ReraService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        this.logger.log('Starting scheduled RERA sync...');
        try {
            await this.reraService.syncAllStates();
            this.logger.log('Scheduled RERA sync jobs queued successfully.');
        } catch (err) {
            this.logger.error(`Scheduled RERA sync failed: ${err.message}`);
        }
    }
}
