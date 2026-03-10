import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '../../common/enums/role.enum';
import { CreateAdsRequestDto, UpdateAdsRequestDto } from './ads-requests.dto';

@Injectable()
export class AdsRequestsService {
    constructor(private prisma: PrismaService) { }

    async findAll(roles: string[] = [], userId?: string) {
        const where: any = {};

        // Marketing managers can see all requests
        // Project partners can only see their own
        if (roles.includes(UserRole.PROPERTY_PARTNER) && !roles.includes(UserRole.MARKETING_MANAGER) && !roles.includes(UserRole.CENTRAL_AUTHORITY)) {
            where.requestedById = userId;
        }

        return this.prisma.adsRequest.findMany({
            where,
            include: {

                project: true,
                requestedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        roles: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string, roles: string[] = [], userId?: string) {
        const request = await this.prisma.adsRequest.findUnique({
            where: { id },
            include: {

                project: true,
                requestedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        roles: true,
                    },
                },
            },
        });

        if (!request) {
            throw new NotFoundException(`Ads request with ID ${id} not found`);
        }

        const isManager = roles.includes(UserRole.MARKETING_MANAGER) || roles.includes(UserRole.CENTRAL_AUTHORITY);

        // Check permissions
        if (!isManager) {
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

                project: true,
                requestedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        roles: true,
                    },
                },
            },
        });
    }

    async update(id: string, dto: UpdateAdsRequestDto, roles: string[] = [], userId?: string) {
        const request = await this.findOne(id, roles, userId);

        const isManager = roles.includes(UserRole.MARKETING_MANAGER) || roles.includes(UserRole.CENTRAL_AUTHORITY);

        // Only marketing managers can update status
        if (dto.status && !isManager) {
            throw new ForbiddenException('Only marketing managers can update request status');
        }

        // Requesters can only update their own requests and not the status
        if (!isManager) {
            if (request.requestedById !== userId) {
                throw new ForbiddenException('You can only update your own ads requests');
            }
            delete dto.status; // Prevent status updates by non-marketing managers
        }

        return this.prisma.adsRequest.update({
            where: { id },
            data: dto,
            include: {

                project: true,
                requestedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        roles: true,
                    },
                },
            },
        });
    }

    async remove(id: string, roles: string[] = [], userId?: string) {
        const request = await this.findOne(id, roles, userId);

        const isManager = roles.includes(UserRole.MARKETING_MANAGER) || roles.includes(UserRole.CENTRAL_AUTHORITY);

        // Only the requester or marketing manager can delete
        if (!isManager) {
            if (request.requestedById !== userId) {
                throw new ForbiddenException('You can only delete your own ads requests');
            }
        }

        return this.prisma.adsRequest.delete({
            where: { id },
        });
    }
}
