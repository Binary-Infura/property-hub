import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './marketing.dto';

@Injectable()
export class MarketingService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.marketingCampaign.findMany({
            include: {
                assignedTo: true,
                project: {
                    include: {
                        onboardedBy: true,
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findMyRequests(userId: string) {
        return this.prisma.marketingCampaign.findMany({
            where: {
                project: {
                    onboardedById: userId,
                },
            },
            include: {
                assignedTo: true,
                project: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const campaign = await this.prisma.marketingCampaign.findUnique({
            where: { id },
            include: {
                assignedTo: true,
            },
        });

        if (!campaign) {
            throw new NotFoundException(`Campaign with ID ${id} not found`);
        }

        return campaign;
    }

    async create(dto: CreateCampaignDto) {
        const { assignedUserIds, startDate, endDate, projectId, ...data } = dto;

        return this.prisma.marketingCampaign.create({
            data: {
                ...data,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                assignedTo: {
                    connect: (assignedUserIds || []).map((id) => ({ id })),
                },
                project: projectId ? { connect: { id: projectId } } : undefined,
            },
            include: {
                assignedTo: true,
                project: true,
            },
        });
    }

    async update(id: string, dto: UpdateCampaignDto) {
        const { assignedUserIds, startDate, endDate, projectId, ...data } = dto;

        return this.prisma.marketingCampaign.update({
            where: { id },
            data: {
                ...data,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                assignedTo: assignedUserIds ? {
                    set: assignedUserIds.map((id) => ({ id })),
                } : undefined,
                project: projectId ? { connect: { id: projectId } } : (projectId === null ? { disconnect: true } : undefined),
            },
            include: {
                assignedTo: true,
                project: true,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.marketingCampaign.delete({
            where: { id },
        });
    }

    @Cron(CronExpression.EVERY_HOUR)
    async handleAutoRejectRequests() {
        const seventyTwoHoursAgo = new Date();
        seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);

        const expiredRequests = await this.prisma.marketingCampaign.updateMany({
            where: {
                status: 'PENDING',
                createdAt: {
                    lt: seventyTwoHoursAgo,
                },
            },
            data: {
                status: 'REJECTED',
            },
        });

        if (expiredRequests.count > 0) {
            console.log(`Auto-rejected ${expiredRequests.count} expired collaboration requests.`);
        }
    }
}
