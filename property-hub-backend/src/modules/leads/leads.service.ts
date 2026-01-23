import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeadDto, UpdateLeadDto } from './leads.dto';
import { Lead } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class LeadsService {
    constructor(private prisma: PrismaService) { }

    async findAll(user: AuthenticatedUser): Promise<Lead[]> {
        const isCentralAuthority = user.roles.includes('central-authority');
        const userRegions = user.groups.map(g => g.split('/').pop());

        const where = isCentralAuthority
            ? {}
            : { regionId: { in: userRegions } };

        return this.prisma.lead.findMany({
            where,
            include: {
                region: true,
                property: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string, user: AuthenticatedUser): Promise<Lead> {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                region: true,
                property: true,
                visits: true,
            },
        });

        if (!lead) {
            throw new NotFoundException(`Lead with ID ${id} not found`);
        }

        const isCentralAuthority = user.roles.includes('central-authority');
        const userRegions = user.groups.map(g => g.split('/').pop());

        if (!isCentralAuthority && !userRegions.includes(lead.regionId)) {
            throw new NotFoundException(`Lead with ID ${id} not found`);
        }

        return lead;
    }

    async create(createLeadDto: CreateLeadDto): Promise<Lead> {
        return this.prisma.lead.create({
            data: createLeadDto,
            include: {
                region: true,
                property: true,
            },
        });
    }

    async update(id: string, updateLeadDto: UpdateLeadDto, user: AuthenticatedUser): Promise<Lead> {
        await this.findOne(id, user);

        return this.prisma.lead.update({
            where: { id },
            data: updateLeadDto,
            include: {
                region: true,
                property: true,
            },
        });
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Lead> {
        await this.findOne(id, user);

        return this.prisma.lead.delete({
            where: { id },
        });
    }
}
