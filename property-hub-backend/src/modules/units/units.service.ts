import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUnitDto, UpdateUnitDto, MarkUnitAsSoldDto, BulkCreateUnitsDto } from './units.dto';
import { PropertyUnit, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class UnitsService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
        private activityLogsService: ActivityLogsService,
    ) { }

    async create(createUnitDto: CreateUnitDto, user: AuthenticatedUser): Promise<PropertyUnit> {
        const internalUser = await this.usersService.ensureUserSynced(user);

        // Verify project ownership (optional: depending on business logic, right now allowed for onboarding-manager, partner etc)
        const project = await this.prisma.project.findUnique({
            where: { id: createUnitDto.projectId },
        });

        if (!project) throw new NotFoundException('Project not found');

        const isPropertyPartner = user.roles.includes(UserRole.PROPERTY_PARTNER);
        const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY);
        if (!isCentralAuthority && isPropertyPartner && project.onboardedById !== internalUser.id) {
            throw new BadRequestException('You can only add units to projects you have onboarded.');
        }

        const { projectId, towerId, ...rest } = createUnitDto;

        const unit = await this.prisma.propertyUnit.create({
            data: {
                ...rest,
                projectId,
                towerId,
            },
        });

        await this.activityLogsService.log({
            userId: internalUser.id,
            type: 'info',
            action: 'Unit Created',
            target: `Unit ${unit.unitNumber} - ${project.name}`,
            details: { unitId: unit.id, projectId: project.id }
        });

        return unit;
    }

    async findByProject(projectId: string, page = 1, limit = 10): Promise<{ units: PropertyUnit[], total: number }> {
        const skip = (page - 1) * limit;
        const [units, total] = await Promise.all([
            this.prisma.propertyUnit.findMany({
                where: { projectId },
                include: { tower: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.propertyUnit.count({
                where: { projectId },
            }),
        ]);
        return { units, total };
    }

    async findOne(id: string): Promise<PropertyUnit> {
        const unit = await this.prisma.propertyUnit.findUnique({
            where: { id },
            include: { project: true },
        });
        if (!unit) throw new NotFoundException('Unit not found');
        return unit;
    }

    async update(id: string, updateUnitDto: UpdateUnitDto, user: AuthenticatedUser): Promise<PropertyUnit> {
        await this.findOne(id);
        return this.prisma.propertyUnit.update({
            where: { id },
            data: updateUnitDto,
        });
    }

    async markAsSold(id: string, dto: MarkUnitAsSoldDto, user: AuthenticatedUser): Promise<PropertyUnit> {
        const unit = await this.findOne(id);
        if (unit.status === 'SOLD') {
            throw new BadRequestException('Unit is already sold');
        }

        const internalUser = await this.usersService.ensureUserSynced(user);

        const updatedUnit = await this.prisma.propertyUnit.update({
            where: { id },
            data: {
                status: 'SOLD',
                buyerName: dto.buyerName,
                buyerPhone: dto.buyerPhone,
                salePrice: dto.salePrice,
                soldAt: new Date(dto.soldAt),
            },
            include: { project: true }
        });

        await this.activityLogsService.log({
            userId: internalUser.id,
            type: 'info',
            action: 'Unit Sold',
            target: `Unit ${updatedUnit.unitNumber} - ${updatedUnit.project.name}`,
            details: {
                unitId: updatedUnit.id,
                projectId: updatedUnit.projectId,
                buyerName: dto.buyerName,
                salePrice: dto.salePrice,
            }
        });

        return updatedUnit;
    }

    async remove(id: string, user: AuthenticatedUser): Promise<PropertyUnit> {
        await this.findOne(id);
        return this.prisma.propertyUnit.delete({
            where: { id },
        });
    }

    async removeBulk(ids: string[], user: AuthenticatedUser): Promise<Prisma.BatchPayload> {
        // Find many to make sure we're only deleting units from the current user's projects
        // though simpler here to just delete since the controller already protects it
        return this.prisma.propertyUnit.deleteMany({
            where: {
                id: { in: ids }
            }
        });
    }

    async createBulk(bulkCreateUnitsDto: BulkCreateUnitsDto, user: AuthenticatedUser): Promise<Prisma.BatchPayload> {
        const { projectId, units } = bulkCreateUnitsDto;

        // Optionally, check if the user is authorized to create units for this project
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: { onboardedById: true }
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${projectId} not found`);
        }

        const internalUser = await this.usersService.ensureUserSynced(user);
        const isPropertyPartner = user.roles.includes(UserRole.PROPERTY_PARTNER);
        const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY);

        if (!isCentralAuthority && isPropertyPartner && project.onboardedById !== internalUser.id) {
            throw new BadRequestException('You do not have permission to create units for this project');
        }

        const data = units.map(unit => ({
            ...unit,
            projectId,
            towerId: (unit as any).towerId, // Ensure towerId is passed if present in UnitItemDto
        }));

        return this.prisma.propertyUnit.createMany({
            data,
            skipDuplicates: true,
        });
    }

    async findMyUnits(user: AuthenticatedUser, page = 1, limit = 10, search?: string, status?: string): Promise<{ units: any[], total: number }> {
        const internalUser = await this.usersService.ensureUserSynced(user);
        const isPropertyPartner = user.roles.includes(UserRole.PROPERTY_PARTNER);
        const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY);

        const baseFilter = (!isCentralAuthority && isPropertyPartner)
            ? { project: { onboardedById: internalUser.id } }
            : {};

        const filter: any = {
            ...baseFilter,
        };

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (search) {
            filter.OR = [
                { unitNumber: { contains: search, mode: 'insensitive' } },
                { buyerName: { contains: search, mode: 'insensitive' } },
                { project: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const skip = (page - 1) * limit;
        const [units, total] = await Promise.all([
            this.prisma.propertyUnit.findMany({
                where: filter,
                include: {
                    tower: true,
                    project: {
                        select: {
                            name: true,
                            location: true,
                            category: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.propertyUnit.count({
                where: filter,
            }),
        ]);

        return { units, total };
    }
}
