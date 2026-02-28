import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RajasthanScraper } from './scrapers/rajasthan.scraper';
import { MaharashtraScraper } from './scrapers/maharashtra.scraper';
import { IReraScraper } from './interfaces/rera-scraper.interface';
import { UsersService } from '../users/users.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class ReraService {
    private readonly logger = new Logger(ReraService.name);
    private readonly scrapers: IReraScraper[];

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('rera-sync') private readonly reraQueue: Queue,
        private readonly usersService: UsersService,
        private readonly activityLogsService: ActivityLogsService,
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

        // Create log entry
        const log = await this.prisma.reraSyncLog.create({
            data: {
                state,
                district,
                status: 'STARTED',
                startedAt: new Date(),
            },
        });

        try {
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
                            ...project as any,
                        },
                    });
                    updatedCount++;
                } catch (err) {
                    this.logger.error(`Error upserting project ${project.reraNumber}: ${err.message}`);
                }
            }

            // Update log entry as completed
            await this.prisma.reraSyncLog.update({
                where: { id: log.id },
                data: {
                    status: 'COMPLETED',
                    projectsScraped: updatedCount,
                    completedAt: new Date(),
                },
            });

            this.logger.log(`Sync completed for ${state}. Processed ${updatedCount} projects.`);
            return { state, processed: updatedCount };
        } catch (error) {
            // Update log entry as failed
            await this.prisma.reraSyncLog.update({
                where: { id: log.id },
                data: {
                    status: 'FAILED',
                    error: error.message,
                    completedAt: new Date(),
                },
            });
            throw error;
        }
    }

    async getActivityLogs(limit: number = 50) {
        return this.prisma.reraSyncLog.findMany({
            orderBy: { startedAt: 'desc' },
            take: limit,
        });
    }

    async getProjects(state?: string, district?: string, search?: string, limit: number = 200) {
        const where: any = {};
        if (state) {
            where.state = { equals: state, mode: 'insensitive' };
        }
        if (district) {
            where.district = { equals: district, mode: 'insensitive' };
        }
        if (search) {
            where.OR = [
                { projectName: { contains: search, mode: 'insensitive' } },
                { reraNumber: { contains: search, mode: 'insensitive' } },
                { promoterName: { contains: search, mode: 'insensitive' } },
                { district: { contains: search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.reraProject.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take: Number(limit) || 200,
        });
    }

    async getUniqueDistricts(state: string) {
        const projects = await this.prisma.reraProject.findMany({
            where: { state: { equals: state, mode: 'insensitive' } },
            select: { district: true },
            distinct: ['district'],
        });

        return projects
            .map(p => p.district)
            .filter((d): d is string => !!d)
            .sort();
    }

    async importProject(projectId: string, user: AuthenticatedUser) {
        const reraProject = await this.prisma.reraProject.findUnique({
            where: { id: projectId },
        });

        if (!reraProject) {
            throw new Error('RERA project not found');
        }

        const internalUser = await this.usersService.ensureUserSynced(user);

        // Check if already imported
        const existing = await this.prisma.project.findFirst({
            where: { name: reraProject.projectName, onboardedById: internalUser.id },
        });

        if (existing) {
            return existing;
        }

        // Create project from RERA project
        const project = await this.prisma.project.create({
            data: {
                name: reraProject.projectName,
                description: `Imported from RERA. Promoter: ${reraProject.promoterName}. RERA Number: ${reraProject.reraNumber}`,
                location: reraProject.district || reraProject.state,
                address: reraProject.address,
                price: 0, // Default price, to be updated by user
                projectType: 'APARTMENT', // Default type
                status: 'DRAFT',
                onboardedById: internalUser.id,
                category: 'flat',
            },
        });

        // Log activity
        await this.activityLogsService.log({
            userId: internalUser.id,
            type: 'info',
            action: 'Project Imported from RERA',
            target: project.name,
            details: { projectId: project.id, reraNumber: reraProject.reraNumber }
        });

        return project;
    }

    async getTotalCount(state: string, district?: string): Promise<number> {
        const scraper = this.scrapers.find((s) => s.getState().toLowerCase() === state.toLowerCase());
        if (!scraper || !scraper.getTotalCount) {
            return 0;
        }
        return scraper.getTotalCount({ district });
    }

    async syncDistrictCounts(state: string) {
        const scraper = this.scrapers.find((s) => s.getState().toLowerCase() === state.toLowerCase());
        if (!scraper || !scraper.getDistrictCounts) {
            throw new Error(`Scraper not found or counts not supported for state: ${state}`);
        }

        this.logger.log(`Syncing district counts for ${state}...`);
        const counts = await scraper.getDistrictCounts();

        for (const item of counts) {
            await this.prisma.reraDistrictCount.upsert({
                where: {
                    state_district: {
                        state: scraper.getState(),
                        district: item.district,
                    },
                },
                update: {
                    projectCount: item.count,
                    updatedAt: new Date(),
                },
                create: {
                    state: scraper.getState(),
                    district: item.district,
                    projectCount: item.count,
                },
            });
        }

        this.logger.log(`Synced counts for ${counts.length} districts in ${state}.`);
        return { state, processed: counts.length };
    }

    async getDistrictCounts(state?: string) {
        const where: any = {};
        if (state) {
            where.state = { equals: state, mode: 'insensitive' };
        }
        return this.prisma.reraDistrictCount.findMany({
            where,
            orderBy: [
                { state: 'asc' },
                { district: 'asc' },
            ],
        });
    }
}
