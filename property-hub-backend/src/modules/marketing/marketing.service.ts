import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './marketing.dto';

@Injectable()
export class MarketingService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.marketingCampaign.findMany({
            include: {
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
                assignedTo: true,
            },
        });

        if (!campaign) {
            throw new NotFoundException(`Campaign with ID ${id} not found`);
        }

        return campaign;
    }

    async create(dto: CreateCampaignDto) {
        const { assignedUserIds, ...data } = dto;

        return this.prisma.marketingCampaign.create({
            data: {
                ...data,

                assignedTo: {
                    connect: assignedUserIds.map((id) => ({ id })),
                },
            },
            include: {
                assignedTo: true,
            },
        });
    }

    async update(id: string, dto: UpdateCampaignDto) {
        const { assignedUserIds, ...data } = dto;

        return this.prisma.marketingCampaign.update({
            where: { id },
            data: {
                ...data,

                assignedTo: assignedUserIds ? {
                    set: assignedUserIds.map((id) => ({ id })),
                } : undefined,
            },
            include: {
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
