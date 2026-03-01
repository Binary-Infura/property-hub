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

    async getAssignedProjectsWithDetails(userId: string) {
        // Fetch projects where this consultant is assigned
        const projects = await this.prisma.project.findMany({
            where: {
                assignedTo: {
                    some: { id: userId }
                }
            },
            include: {
                city: true,
                units: true,
                leads: {
                    include: {
                        campaign: true,
                        visits: true,
                        project: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group leads by campaign for each project, and also return all leads flat for the dashboard
        return projects.map(project => {
            const campaignsMap = new Map();

            project.leads.forEach(lead => {
                if (lead.campaign) {
                    if (!campaignsMap.has(lead.campaign.id)) {
                        campaignsMap.set(lead.campaign.id, {
                            ...lead.campaign,
                            leads: []
                        });
                    }
                    campaignsMap.get(lead.campaign.id).leads.push({
                        ...lead,
                    });
                }
            });

            const campaigns = Array.from(campaignsMap.values());

            return {
                ...project,
                leads: project.leads, // Keep leads list for dashboard
                campaigns: campaigns
            };
        });
    }
}
