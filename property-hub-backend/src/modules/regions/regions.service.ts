import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRegionDto, UpdateRegionDto } from './regions.dto';
import { Region } from '@prisma/client';
import { KeycloakAdminService } from '../keycloak/keycloak-admin.service';

@Injectable()
export class RegionsService {
    constructor(
        private prisma: PrismaService,
        private keycloakAdmin: KeycloakAdminService
    ) { }

    async findAll(): Promise<Region[]> {
        return this.prisma.region.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string): Promise<Region> {
        const region = await this.prisma.region.findUnique({
            where: { id },
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }

        return region;
    }

    async create(createRegionDto: CreateRegionDto): Promise<Region> {
        const existing = await this.prisma.region.findUnique({
            where: { code: createRegionDto.code },
        });

        if (existing) {
            throw new ConflictException(`Region with code ${createRegionDto.code} already exists`);
        }

        const region = await this.prisma.region.create({
            data: createRegionDto,
        });

        // Sync with Keycloak: Create group /regions/:code
        await this.keycloakAdmin.createRegionGroup(region.code, region.name);

        return region;
    }

    async update(id: string, updateRegionDto: UpdateRegionDto): Promise<Region> {
        await this.findOne(id);

        return this.prisma.region.update({
            where: { id },
            data: updateRegionDto,
        });
    }

    async remove(id: string): Promise<Region> {
        await this.findOne(id);

        // Note: In a real app, you might want to check if there are properties/leads attached
        return this.prisma.region.delete({
            where: { id },
        });
    }
}
