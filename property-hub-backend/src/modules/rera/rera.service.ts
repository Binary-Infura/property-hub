import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class ReraService {
    private readonly logger = new Logger(ReraService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly usersService: UsersService,
        private readonly activityLogsService: ActivityLogsService,
    ) { }

    /**
     * Handles manual upload of RERA data in NDJSON format
     */
    async uploadReraData(fileContent: string, state: string, user: AuthenticatedUser) {
        const lines = fileContent.split('\n').filter(line => line.trim());
        this.logger.log(`Processing upload of ${lines.length} RERA projects for ${state}`);

        let updatedCount = 0;
        const internalUser = await this.usersService.ensureUserSynced(user);

        for (const line of lines) {
            try {
                const project = JSON.parse(line);
                if (!project.reraNumber) continue;

                await this.prisma.reraProject.upsert({
                    where: { reraNumber: project.reraNumber },
                    update: {
                        ...project,
                        state: state,
                        updatedAt: new Date(),
                    },
                    create: {
                        ...project,
                        state: state,
                    },
                });
                updatedCount++;
            } catch (err) {
                this.logger.error(`Error processing line: ${err.message}`);
            }
        }

        // Log upload activity
        await this.activityLogsService.log({
            userId: internalUser.id,
            type: 'info',
            action: 'RERA Data Manual Upload',
            target: state,
            details: { count: updatedCount }
        });

        return { success: true, processed: updatedCount };
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
                price: 0,
                projectType: 'APARTMENT',
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

    async getDistrictCounts(state?: string, district?: string) {
        const where: any = {};
        if (state) {
            where.state = { equals: state, mode: 'insensitive' };
        }
        if (district) {
            where.district = { contains: district, mode: 'insensitive' };
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
