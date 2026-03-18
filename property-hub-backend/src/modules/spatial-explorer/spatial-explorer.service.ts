import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SpatialExplorerService {
    constructor(private prisma: PrismaService) {}

    /**
     * Lightweight summary.
     * Returns project info, towers, and per-tower SLIM unit arrays.
     * Each slim unit only carries: id, unitNumber, floor, status, towerId
     * — the bare minimum needed to render and colour the 3D boxes.
     * NO prices, areas, buyer info, etc. in the initial payload.
     */
    async getProjectSummary(projectId: string) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                name: true,
                location: true,
                projectType: true,
                status: true,
                price: true,
                area: true,
                bedrooms: true,
                bathrooms: true,
                towers: {
                    select: {
                        id: true,
                        name: true,
                        totalFloors: true,
                        createdAt: true,
                        updatedAt: true,
                        // Only the slim fields needed for 3D rendering
                        units: {
                            select: {
                                id: true,
                                unitNumber: true,
                                floor: true,
                                status: true,
                                towerId: true,
                            },
                            orderBy: [
                                { floor: 'asc' },
                                { unitNumber: 'asc' },
                            ],
                        },
                    },
                },
            },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Build per-tower count summary alongside slim unit list
        const towerSummaries = project.towers.map(tower => {
            const units = tower.units;
            const counts = {
                total:    units.length,
                DRAFT:    units.filter(u => u.status === 'DRAFT').length,
                RESERVED: units.filter(u => u.status === 'RESERVED').length,
                BOOKED:   units.filter(u => u.status === 'BOOKED').length,
                SOLD:     units.filter(u => u.status === 'SOLD').length,
            };
            return {
                id:          tower.id,
                name:        tower.name,
                totalFloors: tower.totalFloors,
                createdAt:   tower.createdAt,
                updatedAt:   tower.updatedAt,
                unitCounts:  counts,
                units,          // slim units — id/unitNumber/floor/status/towerId only
            };
        });

        // Project-level aggregated stats
        const allUnits = project.towers.flatMap(t => t.units);
        const totalStats = {
            totalUnits:    allUnits.length,
            draftUnits:    allUnits.filter(u => u.status === 'DRAFT').length,
            reservedUnits: allUnits.filter(u => u.status === 'RESERVED').length,
            bookedUnits:   allUnits.filter(u => u.status === 'BOOKED').length,
            soldUnits:     allUnits.filter(u => u.status === 'SOLD').length,
        };

        return {
            project: {
                id:          project.id,
                name:        project.name,
                location:    project.location,
                projectType: project.projectType,
                status:      project.status,
                price:       project.price,
                area:        project.area,
                bedrooms:    project.bedrooms,
                bathrooms:   project.bathrooms,
            },
            towers: towerSummaries,
            stats:  totalStats,
        };
    }

    /**
     * On-demand: fetch FULL details for a single unit.
     * Called when the user clicks on a unit in the 3D explorer.
     */
    async getUnitDetail(projectId: string, unitId: string) {
        const unit = await this.prisma.propertyUnit.findFirst({
            where: { id: unitId, projectId },
            include: {
                tower: {
                    select: { id: true, name: true, totalFloors: true },
                },
            },
        });

        if (!unit) {
            throw new NotFoundException('Unit not found in this project');
        }

        return unit;
    }

    /**
     * Full spatial data (legacy — kept for backward compat).
     */
    async getProjectSpatialData(projectId: string) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                towers: true,
                units: {
                    orderBy: [
                        { floor: 'asc' },
                        { unitNumber: 'asc' },
                    ],
                },
            },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return {
            project,
            towers: project.towers,
            units:  project.units,
            stats:  {
                totalUnits:    project.units.length,
                draftUnits:    project.units.filter(u => u.status === 'DRAFT').length,
                soldUnits:     project.units.filter(u => u.status === 'SOLD').length,
                bookedUnits:   project.units.filter(u => u.status === 'BOOKED').length,
                reservedUnits: project.units.filter(u => u.status === 'RESERVED').length,
            },
        };
    }

    /**
     * All units for the explorer (legacy — kept for backward compat).
     */
    async getExplorerUnits(projectId: string) {
        return this.prisma.propertyUnit.findMany({
            where: { projectId },
            orderBy: [{ floor: 'asc' }, { unitNumber: 'asc' }],
        });
    }
}
