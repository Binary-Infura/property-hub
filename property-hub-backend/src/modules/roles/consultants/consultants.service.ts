import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateConsultantProfileDto } from './consultants.dto';

@Injectable()
export class ConsultantsService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.consultantProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Consultant profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateConsultantProfileDto) {
        return this.prisma.consultantProfile.upsert({
            where: { userId },
            update: {
                specialization: dto.specialization,
                experienceYears: dto.experienceYears,
            },
            create: {
                userId,
                specialization: dto.specialization,
                experienceYears: dto.experienceYears,
            },
        });
    }

    async getAssignedPropertiesWithDetails(userId: string) {
        // Fetch properties where this consultant is assigned
        const properties = await this.prisma.property.findMany({
            where: {
                assignedTo: {
                    some: { id: userId }
                }
            },
            include: {
                city: true,
                leads: {
                    include: {
                        campaign: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group leads by campaign for each property
        return properties.map(property => {
            const campaignsMap = new Map();

            property.leads.forEach(lead => {
                if (lead.campaign) {
                    if (!campaignsMap.has(lead.campaign.id)) {
                        campaignsMap.set(lead.campaign.id, {
                            ...lead.campaign,
                            leads: []
                        });
                    }
                    campaignsMap.get(lead.campaign.id).leads.push({
                        id: lead.id,
                        name: lead.name,
                        email: lead.email,
                        phone: lead.phone,
                        status: lead.status,
                        createdAt: lead.createdAt
                    });
                }
            });

            const campaigns = Array.from(campaignsMap.values());

            return {
                ...property,
                leads: undefined, // Remove flat leads list
                campaigns: campaigns
            };
        });
    }
}
