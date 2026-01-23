import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCommissionDto, UpdateCommissionDto } from './commissions.dto';
import { Commission } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class CommissionsService {
    constructor(private prisma: PrismaService) { }

    async findAll(user: AuthenticatedUser): Promise<Commission[]> {
        // If not central authority, filter by properties in user's regions
        if (user.isCentralAuthority) {
            return this.prisma.commission.findMany({
                include: {
                    property: {
                        include: {
                            region: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        }

        return this.prisma.commission.findMany({
            where: {
                property: {
                    regionId: {
                        in: user.regions,
                    },
                },
            },
            include: {
                property: {
                    include: {
                        region: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string, user: AuthenticatedUser): Promise<Commission> {
        const commission = await this.prisma.commission.findUnique({
            where: { id },
            include: {
                property: {
                    include: {
                        region: true,
                    },
                },
            },
        });

        if (!commission) {
            throw new NotFoundException(`Commission with ID ${id} not found`);
        }

        if (!user.isCentralAuthority && !user.regions.includes(commission.property.regionId)) {
            throw new NotFoundException(`Commission with ID ${id} not found`);
        }

        return commission;
    }

    async create(createCommissionDto: CreateCommissionDto, user: AuthenticatedUser): Promise<Commission> {
        // Verify property exists and user has access to its region
        const property = await this.prisma.property.findUnique({
            where: { id: createCommissionDto.propertyId },
        });

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        if (!user.isCentralAuthority && !user.regions.includes(property.regionId)) {
            throw new ForbiddenException('You do not have access to create commissions for this property');
        }

        return this.prisma.commission.create({
            data: createCommissionDto,
            include: {
                property: {
                    include: {
                        region: true,
                    },
                },
            },
        });
    }

    async update(id: string, updateCommissionDto: UpdateCommissionDto, user: AuthenticatedUser): Promise<Commission> {
        await this.findOne(id, user);

        return this.prisma.commission.update({
            where: { id },
            data: updateCommissionDto,
            include: {
                property: {
                    include: {
                        region: true,
                    },
                },
            },
        });
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Commission> {
        await this.findOne(id, user);

        return this.prisma.commission.delete({
            where: { id },
        });
    }
}
