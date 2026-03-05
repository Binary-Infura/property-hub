import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReelDto } from './reels.dto';
import { Prisma, Reel } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReelsService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
    ) { }

    async findAll(page = 1, limit = 8, projectId?: string): Promise<{ data: Reel[]; total: number; hasMore: boolean }> {
        const skip = (page - 1) * limit;

        const where: Prisma.ReelWhereInput = projectId ? { projectId } : {};

        const [data, total] = await this.prisma.$transaction([
            this.prisma.reel.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            propertyPartnerProfile: true,
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.reel.count({ where }),
        ]);

        return { data, total, hasMore: skip + data.length < total };
    }

    async findByUser(userId: string): Promise<Reel[]> {
        return this.prisma.reel.findMany({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        propertyPartnerProfile: true,
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async create(createReelDto: CreateReelDto, user: AuthenticatedUser): Promise<Reel> {
        const internalUser = await this.usersService.ensureUserSynced(user);

        return this.prisma.reel.create({
            data: {
                title: createReelDto.title,
                description: createReelDto.description,
                videoUrl: createReelDto.videoUrl,
                thumbnailUrl: createReelDto.thumbnailUrl,
                userId: internalUser.id,
                projectId: createReelDto.projectId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
            },
        });
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Reel> {
        const internalUser = await this.usersService.ensureUserSynced(user);
        const reel = await this.prisma.reel.findUnique({
            where: { id },
        });

        if (!reel) {
            throw new NotFoundException(`Reel with ID ${id} not found`);
        }

        if (reel.userId !== internalUser.id && !user.roles.includes('admin')) {
            throw new ForbiddenException('You do not have permission to delete this reel');
        }

        return this.prisma.reel.delete({
            where: { id },
        });
    }
}
