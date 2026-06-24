import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBankDto, UpdateBankDto } from './banks.dto';

@Injectable()
export class BanksService {
    private readonly logger = new Logger(BanksService.name);

    constructor(private prisma: PrismaService) { }

    async createBank(dto: CreateBankDto) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. Create the bank
                const bank = await tx.bank.create({
                    data: {
                        name: dto.name,
                        percentage: dto.percentage,
                        logoUrl: dto.logoUrl,
                        isActive: dto.isActive ?? true,
                    },
                });

                // 2. Create the associated organization
                const organization = await tx.organization.create({
                    data: {
                        name: bank.name,
                        type: 'LOAN_PARTNER',
                    },
                });

                // 3. Link organization back to bank
                return await tx.bank.update({
                    where: { id: bank.id },
                    data: {
                        organizationId: organization.id,
                    },
                });
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('A bank with this name already exists');
            }
            throw error;
        }
    }

    async findAllBanks() {
        return this.prisma.bank.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findActiveBanks() {
        return this.prisma.bank.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async updateBank(id: string, dto: UpdateBankDto) {
        try {
            return await this.prisma.bank.update({
                where: { id },
                data: dto,
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException('Bank not found');
            }
            throw error;
        }
    }

    async deleteBank(id: string) {
        try {
            return await this.prisma.bank.delete({
                where: { id },
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException('Bank not found');
            }
            throw error;
        }
    }
}
