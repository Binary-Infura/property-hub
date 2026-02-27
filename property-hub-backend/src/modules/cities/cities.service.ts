import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AssignCityDto, CreateCityDto } from './cities.dto';
import {
    getStatesOfCountry,
    getCitiesOfState
} from '@countrystatecity/countries';

@Injectable()
export class CitiesService {
    private readonly logger = new Logger(CitiesService.name);
    private readonly countryCode = 'IN';

    constructor(private prisma: PrismaService) { }

    async getIndianStates() {
        try {
            const states = await getStatesOfCountry(this.countryCode);
            return states.sort((a, b) => a.name.localeCompare(b.name)).map(s => ({
                id: s.iso2,
                name: s.name,
                code: s.iso2
            }));
        } catch (error) {
            this.logger.error(`Failed to get states for India: ${error.message}`);
            return [];
        }
    }

    async getCitiesOfState(stateCode: string) {
        try {
            const cities = await getCitiesOfState(this.countryCode, stateCode);
            return cities.sort((a, b) => a.name.localeCompare(b.name)).map(c => ({
                name: c.name
            }));
        } catch (error) {
            this.logger.error(`Failed to get cities for India-${stateCode}: ${error.message}`);
            return [];
        }
    }

    async assignCity(dto: AssignCityDto) {
        try {
            return await this.prisma.cityAllocation.create({
                data: {
                    userId: dto.userId,
                    stateCode: dto.stateCode,
                    cityName: dto.cityName,
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('This city is already assigned to this user');
            }
            throw error;
        }
    }

    async unassignCity(id: string) {
        const allocation = await this.prisma.cityAllocation.findUnique({
            where: { id },
        });
        if (!allocation) {
            throw new NotFoundException('City allocation not found');
        }
        return this.prisma.cityAllocation.delete({
            where: { id },
        });
    }

    async getUserAllocations(userId: string) {
        return this.prisma.cityAllocation.findMany({
            where: { userId },
            orderBy: { assignedAt: 'desc' },
        });
    }

    async getAllAllocations() {
        return this.prisma.cityAllocation.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { assignedAt: 'desc' },
        });
    }

    async searchManagers(query: string) {
        return this.prisma.user.findMany({
            where: {
                OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                ],
                role: { in: ['marketing-manager', 'onboarding-manager'] },
                status: 'active',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
            },
            take: 10,
        });
    }

    async createCity(dto: CreateCityDto) {
        try {
            return await this.prisma.city.create({
                data: dto,
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('A city with this name already exists');
            }
            throw error;
        }
    }

    async updateCity(id: string, dto: any) {
        return this.prisma.city.update({
            where: { id },
            data: dto,
        });
    }

    async deleteCity(id: string) {
        return this.prisma.city.delete({
            where: { id },
        });
    }

    async findAllCities() {
        return this.prisma.city.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async getManagedCities(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [cities, total] = await Promise.all([
            this.prisma.city.findMany({
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { properties: true }
                    },
                    properties: {
                        select: { price: true }
                    }
                },
                orderBy: { name: 'asc' }
            }),
            this.prisma.city.count()
        ]);

        const data = (cities as any[]).map(city => {
            const propertiesCount = city._count?.properties || 0;
            const revenue = city.properties?.reduce((sum: number, p: any) => sum + Number(p.price || 0), 0) || 0;
            return {
                id: city.id,
                name: city.name,
                state: city.state,
                active: city.active ?? true,
                propertiesCount,
                revenue,
                location: {
                    state: city.state,
                    city: city.name
                }
            };
        });

        return { data, total };
    }
}
