import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PostalCodesService {
    constructor(private prisma: PrismaService) { }

    async findAll(page: number = 1, limit: number = 20, search?: string) {
        const skip = (page - 1) * limit;

        const where: any = search ? {
            OR: [
                { code: { contains: search, mode: 'insensitive' } },
                { officeName: { contains: search, mode: 'insensitive' } },
                { district: { contains: search, mode: 'insensitive' } },
                { stateName: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
            ],
        } : {};

        try {
            const [items, total] = await Promise.all([
                (this.prisma as any).postalCode.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                (this.prisma as any).postalCode.count({ where }),
            ]);

            return {
                items,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            console.error('Error fetching postal codes:', error);
            throw error;
        }
    }

    async findByCode(code: string) {
        try {
            return await (this.prisma as any).postalCode.findFirst({
                where: {
                    code: {
                        equals: code,
                        mode: 'insensitive',
                    },
                },
            });
        } catch (error) {
            console.error('Error finding postal code:', error);
            throw error;
        }
    }
}
