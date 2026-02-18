import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RajasthanScraper } from './scrapers/rajasthan.scraper';
import { MaharashtraScraper } from './scrapers/maharashtra.scraper';
import { IReraScraper } from './interfaces/rera-scraper.interface';

@Injectable()
export class ReraService {
    private readonly logger = new Logger(ReraService.name);
    private readonly scrapers: IReraScraper[];

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('rera-sync') private readonly reraQueue: Queue,
        rajasthanScraper: RajasthanScraper,
        maharashtraScraper: MaharashtraScraper,
    ) {
        this.scrapers = [rajasthanScraper, maharashtraScraper];
    }

    async syncAllStates() {
        this.logger.log('Queuing sync jobs for all states...');
        for (const scraper of this.scrapers) {
            await this.reraQueue.add('sync-state', { state: scraper.getState() });
        }
    }

    async syncState(state: string, district?: string) {
        const scraper = this.scrapers.find((s) => s.getState().toLowerCase() === state.toLowerCase());
        if (!scraper) {
            throw new Error(`Scraper not found for state: ${state}`);
        }

        this.logger.log(`Starting sync for ${state}${district ? ` (District: ${district})` : ''}...`);
        const projects = await scraper.scrape({ district });
        this.logger.log(`Found ${projects.length} projects for ${state}.`);

        let updatedCount = 0;
        for (const project of projects) {
            try {
                if (!project.reraNumber) continue;

                await this.prisma.reraProject.upsert({
                    where: { reraNumber: project.reraNumber },
                    update: {
                        ...project,
                        updatedAt: new Date(),
                    },
                    create: {
                        ...project as any, // Cast because we know it has required fields
                    },
                });
                updatedCount++;
            } catch (err) {
                this.logger.error(`Error upserting project ${project.reraNumber}: ${err.message}`);
            }
        }

        this.logger.log(`Sync completed for ${state}. Processed ${updatedCount} projects.`);
        return { state, processed: updatedCount };
    }

    async getProjects(state?: string, limit: number = 200) {
        return this.prisma.reraProject.findMany({
            where: state ? { state: { equals: state, mode: 'insensitive' } } : {},
            orderBy: { updatedAt: 'desc' },
            take: limit,
        });
    }
}
