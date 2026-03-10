import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateConsultantProfileDto } from './consultants.dto';

@Injectable()
export class ConsultantsService {
    constructor(private prisma: PrismaService) { }

    /**
     * CONSULTANT has no separate profile table.
     * Profile data (consultantType, specialization, experienceYears, rating, visitsConducted)
     * is stored in User.profileData JSON.
     */
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { profileData: true },
        });
        if (!user) {
            throw new NotFoundException('Consultant user not found');
        }
        return user.profileData;
    }

    async upsertProfile(userId: string, dto: UpdateConsultantProfileDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const existing = (user.profileData as Record<string, any>) || {};
        const merged = {
            ...existing,
            ...(dto.specialization ? { specialization: dto.specialization } : {}),
            ...(dto.experienceYears !== undefined ? { experienceYears: dto.experienceYears } : {}),
            // consultantType is usually set at creation or via a separate admin action,
            // but we can include it here if the DTO allows.
        };

        return this.prisma.user.update({
            where: { id: userId },
            data: { profileData: merged },
            select: { id: true, profileData: true },
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
