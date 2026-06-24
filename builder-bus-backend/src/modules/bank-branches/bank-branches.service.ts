import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBankBranchDto, UpdateBankBranchDto } from './bank-branches.dto';

@Injectable()
export class BankBranchesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateBankBranchDto) {
        const bank = await this.prisma.bank.findUnique({
            where: { id: dto.bankId },
            select: { organizationId: true }
        });

        if (!bank || !bank.organizationId) {
            throw new BadRequestException('Bank is not properly configured with an Organization');
        }

        const normalizedName = (dto.name || '').trim().toLowerCase();

        try {
            return await this.prisma.bankBranch.create({
                data: {
                    bankId: dto.bankId,
                    organizationId: bank.organizationId,
                    cityId: dto.cityId,
                    name: normalizedName,
                    address: dto.address,
                    isActive: dto.isActive ?? true,
                }
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('A branch with this name already exists for this bank in this city');
            }
            throw error;
        }
    }

    async findAll(query: { bankId?: string; cityId?: string; isActive?: boolean }) {
        const where: any = {};
        if (query.bankId) where.bankId = query.bankId;
        if (query.cityId) where.cityId = query.cityId;
        if (query.isActive !== undefined) where.isActive = query.isActive;

        return this.prisma.bankBranch.findMany({
            where,
            include: {
                bank: { select: { name: true } },
                city: { select: { name: true } }
            },
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string) {
        const branch = await this.prisma.bankBranch.findUnique({
            where: { id },
            include: {
                bank: true,
                organization: true,
                city: true
            }
        });
        if (!branch) throw new NotFoundException('Bank branch not found');
        return branch;
    }

    async update(id: string, dto: UpdateBankBranchDto) {
        const normalizedName = dto.name ? dto.name.trim().toLowerCase() : undefined;

        try {
            return await this.prisma.bankBranch.update({
                where: { id },
                data: {
                    ...dto,
                    name: normalizedName
                }
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException('Bank branch not found');
            }
            if (error.code === 'P2002') {
                throw new ConflictException('A branch with this name already exists for this bank in this city');
            }
            throw error;
        }
    }

    async remove(id: string) {
        try {
            return await this.prisma.bankBranch.delete({
                where: { id }
            });
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException('Bank branch not found');
            }
            throw error;
        }
    }
}
