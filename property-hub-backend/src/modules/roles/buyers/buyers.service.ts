import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UpdateBuyerProfileDto, RegisterBuyerDto } from './buyers.dto';
import { UsersService } from '../../users/users.service';

@Injectable()
export class BuyersService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService
    ) { }

    async getProfile(userId: string) {
        const profile = await this.prisma.buyerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Buyer profile not found');
        }
        return profile;
    }

    async upsertProfile(userId: string, dto: UpdateBuyerProfileDto) {
        return this.prisma.buyerProfile.upsert({
            where: { userId },
            update: {
                budgetMin: dto.budgetMin,
                budgetMax: dto.budgetMax,
                preferredLocations: dto.preferredLocations,
            },
            create: {
                userId,
                budgetMin: dto.budgetMin,
                budgetMax: dto.budgetMax,
                preferredLocations: dto.preferredLocations,
            },
        });
    }

    async register(dto: RegisterBuyerDto) {
        // 1. Parse budget string (e.g. "20-40") into min/max numbers
        let budgetMin: number | undefined;
        let budgetMax: number | undefined;

        if (dto.budget) {
            if (dto.budget.includes('cr+')) {
                // Handle "2cr+" -> min 20000000
                const minStr = dto.budget.replace('cr+', '');
                budgetMin = parseFloat(minStr) * 10000000;
            } else if (dto.budget.includes('cr')) {
                // Handle "1cr-2cr" -> 10000000 - 20000000 or "80-1cr" -> 8000000 - 10000000
                const parts = dto.budget.split('-');
                if (parts.length === 2) {
                    const parsePart = (part: string) => {
                        if (part.includes('cr')) {
                            return parseFloat(part.replace('cr', '')) * 10000000;
                        } else {
                            // optimize for lakhs if no unit specified in first part but present in second ? 
                            // Usually "80-1cr" implies 80L
                            // Assuming default is Lakhs if not Cr
                            return parseFloat(part) * 100000;
                        }
                    };
                    budgetMin = parsePart(parts[0]);
                    budgetMax = parsePart(parts[1]);
                }
            } else {
                // Handle "20-40" (Lakhs)
                const parts = dto.budget.split('-');
                if (parts.length === 2) {
                    budgetMin = parseFloat(parts[0]) * 100000;
                    budgetMax = parseFloat(parts[1]) * 100000;
                }
            }
        }

        // 2. Create User via UsersService
        // This handles Keycloak invite + Local DB creation
        const user = await this.usersService.createUser({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            role: 'buyer',
            regionIds: [] // Buyers might not be tied to a region initially or we use location preference
        });

        // 3. Create Buyer Profile
        await this.upsertProfile(user.id, {
            budgetMin,
            budgetMax,
            preferredLocations: [dto.location]
            // Intent is not in profile yet? We might need to store it or ignore for now.
        });

        return user;
    }
}
