import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTowerDto, UpdateTowerDto } from './towers.dto';
import { Tower } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class TowersService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
        private activityLogsService: ActivityLogsService,
    ) { }

    async create(createTowerDto: CreateTowerDto, user: AuthenticatedUser): Promise<Tower> {
        const internalUser = await this.usersService.ensureUserSynced(user);

        const project = await this.prisma.project.findUnique({
            where: { id: createTowerDto.projectId },
        });

        if (!project) throw new NotFoundException('Project not found');

        const isPropertyPartner = user.roles.includes(UserRole.PROPERTY_PARTNER);
        const isCentralAuthority = user.roles.includes(UserRole.CENTRAL_AUTHORITY);
        if (!isCentralAuthority && isPropertyPartner && project.onboardedById !== internalUser.id) {
            throw new BadRequestException('You can only add towers to projects you have onboarded.');
        }

        const tower = await this.prisma.tower.create({
            data: createTowerDto,
        });

        await this.activityLogsService.log({
            userId: internalUser.id,
            type: 'info',
            action: 'Tower Created',
            target: `Tower ${tower.name} - ${project.name}`,
            details: { towerId: tower.id, projectId: project.id }
        });

        return tower;
    }

    async findByProject(projectId: string): Promise<Tower[]> {
        return this.prisma.tower.findMany({
            where: { projectId },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string): Promise<Tower> {
        const tower = await this.prisma.tower.findUnique({
            where: { id },
            include: { project: true },
        });
        if (!tower) throw new NotFoundException('Tower not found');
        return tower;
    }

    async update(id: string, updateTowerDto: UpdateTowerDto, user: AuthenticatedUser): Promise<Tower> {
        await this.findOne(id);
        const internalUser = await this.usersService.ensureUserSynced(user);
        
        const tower = await this.prisma.tower.update({
            where: { id },
            data: updateTowerDto,
            include: { project: true }
        });

        await this.activityLogsService.log({
            userId: internalUser.id,
            type: 'info',
            action: 'Tower Updated',
            target: `Tower ${tower.name} - ${tower.project.name}`,
            details: { towerId: tower.id, projectId: tower.projectId }
        });

        return tower;
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Tower> {
        await this.findOne(id);
        const internalUser = await this.usersService.ensureUserSynced(user);
        
        const tower = await this.prisma.tower.delete({
            where: { id },
            include: { project: true }
        });

        await this.activityLogsService.log({
            userId: internalUser.id,
            type: 'info',
            action: 'Tower Deleted',
            target: `Tower ${tower.name} - ${tower.project.name}`,
            details: { towerId: tower.id, projectId: tower.projectId }
        });

        return tower;
    }
}
