import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLoanDto, UpdateLoanStatusDto } from './loans.dto';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class LoansService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateLoanDto) {
        return this.prisma.loan.create({
            data: {
                leadId: dto.leadId,
                projectId: dto.projectId,
                bankId: dto.bankId,
                amount: dto.amount,
                tenureYears: dto.tenureYears,
                interestRate: dto.interestRate,
                notes: dto.notes,
                status: 'PENDING',
            }
        });
    }

    async updateStatus(id: string, dto: UpdateLoanStatusDto) {
        return this.prisma.loan.update({
            where: { id },
            data: { status: dto.status }
        });
    }

    async findByConsultant(userId: string) {
        // Find projects assigned to consultant
        const projectIds = (await this.prisma.project.findMany({
            where: {
                assignedTo: { some: { id: userId } }
            },
            select: { id: true }
        })).map(p => p.id);

        return this.prisma.loan.findMany({
            where: {
                projectId: { in: projectIds }
            },
            include: {
                lead: true,
                project: true,
                bank: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getALl() {
        return this.prisma.loan.findMany({
            include: {
                lead: true,
                project: true,
                bank: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string) {
        const loan = await this.prisma.loan.findUnique({
            where: { id },
            include: {
                lead: true,
                project: true,
                bank: true
            }
        });
        if (!loan) throw new NotFoundException('Loan not found');
        return loan;
    }
}
