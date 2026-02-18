import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ReraService } from './rera.service';

@Processor('rera-sync')
export class ReraProcessor extends WorkerHost {
    private readonly logger = new Logger(ReraProcessor.name);

    constructor(private readonly reraService: ReraService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);

        switch (job.name) {
            case 'sync-state':
                const { state } = job.data;
                return await this.reraService.syncState(state);
            default:
                this.logger.warn(`Unknown job type: ${job.name}`);
                break;
        }
    }
}
