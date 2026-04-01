import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLoanDto, UpdateLoanStatusDto, ApplyLoanDto } from './loans.dto';
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

    async applyForLoan(dto: ApplyLoanDto, user: AuthenticatedUser) {
        const orConditions = [];
        if (user.email) orConditions.push({ email: user.email });
        if (user.phone) orConditions.push({ phone: user.phone });

        let lead = null;
        if (orConditions.length > 0) {
            lead = await this.prisma.lead.findFirst({
                where: {
                    projectId: dto.projectId,
                    OR: orConditions
                }
            });
        }

        if (!lead) {
            lead = await this.prisma.lead.create({
                data: {
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Buyer',
                    email: user.email,
                    phone: user.phone || '0000000000',
                    projectId: dto.projectId,
                    source: 'Dashboard Loan Application',
                    assignedTo: dto.loanPartnerId || null,
                }
            });
        } else if (dto.loanPartnerId && lead.assignedTo !== dto.loanPartnerId) {
            lead = await this.prisma.lead.update({
                where: { id: lead.id },
                data: { assignedTo: dto.loanPartnerId }
            });
        }

        return this.prisma.loan.create({
            data: {
                leadId: lead.id,
                projectId: dto.projectId,
                bankId: dto.bankId,
                amount: dto.amount,
                tenureYears: dto.tenureYears,
                interestRate: dto.interestRate,
                notes: dto.notes,
                status: 'PENDING',
                documents: dto.documents || [],
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

    async findByUser(email?: string, phone?: string) {
        if (!email && !phone) return [];

        const where: any = {
            lead: {}
        };

        if (email) where.lead.email = email;
        else if (phone) where.lead.phone = phone;

        return this.prisma.loan.findMany({
            where,
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
