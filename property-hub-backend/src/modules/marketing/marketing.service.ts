import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './marketing.dto';

@Injectable()
export class MarketingService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.marketingCampaign.findMany({
            include: {
                targetRegions: true,
                assignedTo: true,
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
                targetRegions: true,
                assignedTo: true,
            },
        });

        if (!campaign) {
            throw new NotFoundException(`Campaign with ID ${id} not found`);
        }

        return campaign;
    }

    async create(dto: CreateCampaignDto) {
        const { targetRegionIds, assignedUserIds, ...data } = dto;

        return this.prisma.marketingCampaign.create({
            data: {
                ...data,
                targetRegions: {
                    connect: targetRegionIds.map((id) => ({ id })),
                },
                assignedTo: {
                    connect: assignedUserIds.map((id) => ({ id })),
                },
            },
            include: {
                targetRegions: true,
                assignedTo: true,
            },
        });
    }

    async update(id: string, dto: UpdateCampaignDto) {
        const { targetRegionIds, assignedUserIds, ...data } = dto;

        return this.prisma.marketingCampaign.update({
            where: { id },
            data: {
                ...data,
                targetRegions: targetRegionIds ? {
                    set: targetRegionIds.map((id) => ({ id })),
                } : undefined,
                assignedTo: assignedUserIds ? {
                    set: assignedUserIds.map((id) => ({ id })),
                } : undefined,
            },
            include: {
                targetRegions: true,
                assignedTo: true,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.marketingCampaign.delete({
            where: { id },
        });
    }
}
