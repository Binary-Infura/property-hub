import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto } from './properties.dto';
import { Property } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class PropertiesService {
    constructor(private prisma: PrismaService) { }

    async findAll(user: AuthenticatedUser): Promise<Property[]> {
        const where = user.isCentralAuthority
            ? {} // Central authority sees all properties
            : { regionId: { in: user.regions.map(r => r) } }; // Filter by user's regions

        return this.prisma.property.findMany({
            where,
            include: {
                region: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string, user: AuthenticatedUser): Promise<Property> {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                region: true,
                commissions: true,
            },
        });

        if (!property) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }

        // Check region access
        if (!user.isCentralAuthority && !user.regions.includes(property.regionId)) {
            throw new NotFoundException(`Property with ID ${id} not found`);
        }

        return property;
    }

    async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
        return this.prisma.property.create({
            data: createPropertyDto,
            include: {
                region: true,
            },
        });
    }

    async update(id: string, updatePropertyDto: UpdatePropertyDto, user: AuthenticatedUser): Promise<Property> {
        // Verify property exists and user has access
        await this.findOne(id, user);

        return this.prisma.property.update({
            where: { id },
            data: updatePropertyDto,
            include: {
                region: true,
            },
        });
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Property> {
        // Verify property exists and user has access
        await this.findOne(id, user);

        return this.prisma.property.delete({
            where: { id },
        });
    }
}
