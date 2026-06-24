import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCityDto } from './cities.dto';
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



    async createCity(dto: CreateCityDto) {
        try {
            return await this.prisma.city.create({
                data: dto as any,
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

    async findAllCities(state?: string) {
        const where = state ? { state: { equals: state, mode: 'insensitive' as const } } : {};
        return this.prisma.city.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }

    async getManagedCities(page: number = 1, limit: number = 10, state?: string) {
        const skip = (page - 1) * limit;
        const where = state ? { state: { equals: state, mode: 'insensitive' as const } } : {};
        
        const [cities, total] = await Promise.all([
            this.prisma.city.findMany({
                where,
                skip,
                take: limit,
                include: {
                    addresses: {
                        include: {
                            projects: {
                                select: { price: true }
                            }
                        }
                    }
                },
                orderBy: { name: 'asc' }
            }),
            this.prisma.city.count({ where })
        ]);

        const data = (cities as any[]).map(city => {
            const projects = city.addresses?.flatMap((a: any) => a.projects) || [];
            const projectsCount = projects.length;
            const revenue = projects.reduce((sum: number, p: any) => sum + Number(p.price || 0), 0);
            return {
                id: city.id,
                name: city.name,
                state: city.state,
                active: city.active ?? true,
                projectsCount,
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
