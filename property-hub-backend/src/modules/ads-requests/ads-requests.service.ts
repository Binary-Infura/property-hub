import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAdsRequestDto, UpdateAdsRequestDto } from './ads-requests.dto';

@Injectable()
export class AdsRequestsService {
    constructor(private prisma: PrismaService) { }

    async findAll(userRole?: string, userId?: string) {
        const where: any = {};

        // Marketing managers can see all requests
        // Regional managers and property partners can only see their own
        if (userRole === 'regional-manager' || userRole === 'property-partner') {
            where.requestedById = userId;
        }

        return this.prisma.adsRequest.findMany({
            where,
            include: {
                region: true,
                property: true,
                requestedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string, userRole?: string, userId?: string) {
        const request = await this.prisma.adsRequest.findUnique({
            where: { id },
            include: {
                region: true,
                property: true,
                requestedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        if (!request) {
            throw new NotFoundException(`Ads request with ID ${id} not found`);
        }

        // Check permissions
        if (userRole !== 'marketing-manager' && userRole !== 'central-authority') {
            if (request.requestedById !== userId) {
                throw new ForbiddenException('You can only view your own ads requests');
            }
        }

        return request;
    }

    async create(dto: CreateAdsRequestDto, userId: string) {
        return this.prisma.adsRequest.create({
            data: {
                ...dto,
                requestedById: userId,
            },
            include: {
                region: true,
                property: true,
                requestedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }

    async update(id: string, dto: UpdateAdsRequestDto, userRole?: string, userId?: string) {
        const request = await this.findOne(id, userRole, userId);

        // Only marketing managers can update status
        if (dto.status && userRole !== 'marketing-manager' && userRole !== 'central-authority') {
            throw new ForbiddenException('Only marketing managers can update request status');
        }

        // Requesters can only update their own requests and not the status
        if (userRole !== 'marketing-manager' && userRole !== 'central-authority') {
            if (request.requestedById !== userId) {
                throw new ForbiddenException('You can only update your own ads requests');
            }
            delete dto.status; // Prevent status updates by non-marketing managers
        }

        return this.prisma.adsRequest.update({
            where: { id },
            data: dto,
            include: {
                region: true,
                property: true,
                requestedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }

    async remove(id: string, userRole?: string, userId?: string) {
        const request = await this.findOne(id, userRole, userId);

        // Only the requester or marketing manager can delete
        if (userRole !== 'marketing-manager' && userRole !== 'central-authority') {
            if (request.requestedById !== userId) {
                throw new ForbiddenException('You can only delete your own ads requests');
            }
        }

        return this.prisma.adsRequest.delete({
            where: { id },
        });
    }
}
