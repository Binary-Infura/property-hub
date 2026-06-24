import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCommissionDto, UpdateCommissionDto } from './commissions.dto';
import { Commission } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class CommissionsService {
    constructor(private prisma: PrismaService) { }

    async findAll(user: AuthenticatedUser): Promise<Commission[]> {
        return this.prisma.commission.findMany({
            include: {
                project: true,
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
                project: true,
            },
        });

        if (!commission) {
            throw new NotFoundException(`Commission with ID ${id} not found`);
        }

        return commission;
    }

    async create(createCommissionDto: CreateCommissionDto, user: AuthenticatedUser): Promise<Commission> {
        // Verify project exists
        const project = await this.prisma.project.findUnique({
            where: { id: createCommissionDto.projectId },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return this.prisma.commission.create({
            data: createCommissionDto,
            include: {
                project: true,
            },
        });
    }

    async update(id: string, updateCommissionDto: UpdateCommissionDto, user: AuthenticatedUser): Promise<Commission> {
        await this.findOne(id, user);

        return this.prisma.commission.update({
            where: { id },
            data: updateCommissionDto,
            include: {
                project: true,
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
