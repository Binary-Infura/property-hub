import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ActivityLogsService {
    constructor(private prisma: PrismaService) { }

    async log(data: {
        userId?: string;
        type: 'info' | 'alert' | 'warning';
        action: string;
        target: string;
        details?: any;
    }) {
        return (this.prisma as any).activityLog.create({
            data: {
                userId: data.userId,
                type: data.type,
                action: data.action,
                target: data.target,
                details: data.details || {},
            },
        });
    }

    async getRecentLogs(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            (this.prisma as any).activityLog.findMany({
                skip,
                take: limit,
                orderBy: {
                    timestamp: 'desc',
                },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            // agencyName: true, // agencyName might not exist in User model anymore or was removed in recent refactors, let's keep it safe
                        },
                    },
                },
            }),
            (this.prisma as any).activityLog.count()
        ]);

        return { data, total };
    }

    async getLogsByLeadId(leadId: string) {
        return (this.prisma as any).activityLog.findMany({
            where: { leadId },
            orderBy: {
                timestamp: 'desc',
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }
}
