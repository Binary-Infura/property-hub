import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Project, PropertyUnit, Tower } from '@prisma/client';

@Injectable()
export class SpatialExplorerService {
    constructor(private prisma: PrismaService) {}

    /**
     * Fetch all data required for the 3D Spatial Explorer in one go.
     * This ensures the explorer has all building, tower, and unit data
     * without being throttled by standard pagination.
     */
    async getProjectSpatialData(projectId: string) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                towers: true,
                units: {
                    orderBy: [
                        { floor: 'asc' },
                        { unitNumber: 'asc' }
                    ]
                }
            }
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return {
            project,
            towers: project.towers,
            units: project.units,
            stats: {
                totalUnits: project.units.length,
                draftUnits: project.units.filter(u => u.status === 'DRAFT').length,
                soldUnits: project.units.filter(u => u.status === 'SOLD').length,
                bookedUnits: project.units.filter(u => u.status === 'BOOKED').length,
                reservedUnits: project.units.filter(u => u.status === 'RESERVED').length,
            }
        };
    }

    /**
     * Fetch just the units for the explorer.
     */
    async getExplorerUnits(projectId: string): Promise<PropertyUnit[]> {
        return this.prisma.propertyUnit.findMany({
            where: { projectId },
            orderBy: [
                { floor: 'asc' },
                { unitNumber: 'asc' }
            ]
        });
    }
}
