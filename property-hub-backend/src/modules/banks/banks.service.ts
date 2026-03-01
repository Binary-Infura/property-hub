import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBankDto, UpdateBankDto } from './banks.dto';

@Injectable()
export class BanksService {
    private readonly logger = new Logger(BanksService.name);

    constructor(private prisma: PrismaService) { }

    async createBank(dto: CreateBankDto) {
        try {
            return await this.prisma.bank.create({
                data: dto,
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
