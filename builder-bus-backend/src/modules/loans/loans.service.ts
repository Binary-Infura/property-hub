import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateBuyerLoanApplicationDto,
    UpdateBuyerLoanStatusDto,
    AssignBuyerLoanPartnerDto,
    LinkBuyerLoanDocumentsDto,
    CreateProjectLoanApplicationDto,
    UpdateProjectLoanReviewDto,
    AssignProjectLoanPartnerDto,
    LinkProjectLoanDocumentsDto,
} from './loans.dto';

const BUYER_LOAN_INCLUDE = {
    lead: {
        select: {
            id: true, name: true, email: true, phone: true, status: true, buyerId: true,
            project: { select: { id: true, name: true, projectType: true } },
        }
    },
    bank: { select: { id: true, name: true, logoUrl: true, percentage: true } },
    assignedLoanPartner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    documents: {
        select: { id: true, name: true, category: true, url: true, status: true, createdAt: true }
    },
};

const PROJECT_LOAN_INCLUDE = {
    project: {
        select: {
            id: true, name: true, projectType: true, status: true,
            onboardedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            addressRecord: { select: { city: { select: { id: true, name: true, state: true } } } },
        }
    },
    bank: { select: { id: true, name: true, logoUrl: true, percentage: true } },
    assignedLoanPartner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    documents: {
        select: { id: true, name: true, category: true, url: true, status: true, createdAt: true }
    },
};

@Injectable()
export class LoansService {
    constructor(private prisma: PrismaService) { }

    // ────────────────────────────────────────────────
    // FLOW 1: Buyer Loan Applications
    // ────────────────────────────────────────────────

    async createBuyerLoan(dto: CreateBuyerLoanApplicationDto, creatorId?: string) {
        let leadId = dto.leadId;

        // If no leadId provided, try to find or create a lead for the current buyer
        if (!leadId && creatorId) {
            const user = await this.prisma.user.findUnique({ where: { id: creatorId } });
            if (user) {
                // Find existing lead for this buyer
                const existingLead = await this.prisma.lead.findFirst({
                    where: { buyerId: creatorId }
                });

                if (existingLead) {
                    leadId = existingLead.id;
                    // Update project if provided
                    if (dto.projectId) {
                        await this.prisma.lead.update({
                            where: { id: leadId },
                            data: { projectId: dto.projectId }
                        });
                    }
                } else {
                    // Create a new lead for this buyer
                    const newLead = await this.prisma.lead.create({
                        data: {
                            buyerId: creatorId,
                            name: `${user.firstName} ${user.lastName || ''}`.trim(),
                            phone: user.phone || '0000000000',
                            email: user.email,
                            status: 'NEW',
                            source: 'LOAN_DASHBOARD',
                            projectId: dto.projectId
                        }
                    });
                    leadId = newLead.id;
                }
            }
        } else if (leadId && dto.projectId) {
            // Update existing lead with project
            await this.prisma.lead.update({
                where: { id: leadId },
                data: { projectId: dto.projectId }
            });
        }

        if (!leadId) {
            throw new ForbiddenException('Lead is required to create a loan application.');
        }

        return this.prisma.buyerLoanApplication.create({
            data: {
                leadId: leadId,
                loanAmount: dto.loanAmount,
                eligibleAmount: dto.eligibleAmount,
                bankId: dto.bankId,
                notes: dto.notes,
            },
            include: BUYER_LOAN_INCLUDE,
        });
    }

    async getAllBuyerLoans() {
        return this.prisma.buyerLoanApplication.findMany({
            include: BUYER_LOAN_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }

    async getBuyerLoansByPartner(loanPartnerId: string) {
        return this.prisma.buyerLoanApplication.findMany({
            where: {
                OR: [
                    { assignedLoanPartnerId: loanPartnerId },
                    { lead: { project: { assignedTo: { some: { id: loanPartnerId } } } } }
                ]
            },
            include: BUYER_LOAN_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }

    async getBuyerLoansByBuyer(buyerId: string) {
        return this.prisma.buyerLoanApplication.findMany({
            where: { lead: { buyerId } },
            include: BUYER_LOAN_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }

    async getBuyerLoanById(id: string, requesterId?: string, isLoanPartner?: boolean, isBuyer?: boolean) {
        const loan = await this.prisma.buyerLoanApplication.findUnique({
            where: { id },
            include: {
                ...BUYER_LOAN_INCLUDE,
                lead: {
                    ...BUYER_LOAN_INCLUDE.lead,
                    include: {
                        project: {
                            include: { assignedTo: true }
                        }
                    }
                }
            },
        });
        if (!loan) throw new NotFoundException('Buyer loan application not found');

        if (isLoanPartner) {
            const isDirectlyAssigned = loan.assignedLoanPartnerId === requesterId;
            const isAssignedViaProject = loan.lead.project?.assignedTo?.some(u => u.id === requesterId);
            if (!isDirectlyAssigned && !isAssignedViaProject) {
                throw new ForbiddenException('You are not assigned to this loan application');
            }
        }

        if (isBuyer && loan.lead.buyerId !== requesterId) {
            throw new ForbiddenException('You do not have access to this loan application');
        }

        return loan;
    }

    async updateBuyerLoanStatus(id: string, dto: UpdateBuyerLoanStatusDto, requesterId: string, isLoanPartner: boolean) {
        const loan = await this.getBuyerLoanById(id, requesterId, isLoanPartner);
        
        return this.prisma.buyerLoanApplication.update({
            where: { id },
            data: { status: dto.status, notes: dto.notes },
            include: BUYER_LOAN_INCLUDE,
        });
    }

    async assignBuyerLoanPartner(id: string, dto: AssignBuyerLoanPartnerDto) {
        const loan = await this.prisma.buyerLoanApplication.findUnique({ where: { id } });
        if (!loan) throw new NotFoundException('Buyer loan application not found');

        return this.prisma.buyerLoanApplication.update({
            where: { id },
            data: { assignedLoanPartnerId: dto.assignedLoanPartnerId },
            include: BUYER_LOAN_INCLUDE,
        });
    }

    async linkBuyerLoanDocuments(id: string, dto: LinkBuyerLoanDocumentsDto) {
        const loan = await this.prisma.buyerLoanApplication.findUnique({ where: { id } });
        if (!loan) throw new NotFoundException('Buyer loan application not found');

        return this.prisma.buyerLoanApplication.update({
            where: { id },
            data: {
                documents: { connect: dto.documentIds.map(docId => ({ id: docId })) }
            },
            include: BUYER_LOAN_INCLUDE,
        });
    }

    // ────────────────────────────────────────────────
    // FLOW 2: Project Loan Applications
    // ────────────────────────────────────────────────

    async createProjectLoanApplications(dto: CreateProjectLoanApplicationDto) {
        const results = await Promise.all(
            dto.bankIds.map(bankId =>
                this.prisma.projectLoanApplication.upsert({
                    where: { projectId_bankId: { projectId: dto.projectId, bankId } },
                    create: { projectId: dto.projectId, bankId },
                    update: {},
                    include: PROJECT_LOAN_INCLUDE,
                })
            )
        );
        return results;
    }

    async getAllProjectLoanApps() {
        return this.prisma.projectLoanApplication.findMany({
            include: PROJECT_LOAN_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }

    async getProjectLoanAppsByOwner(ownerId: string) {
        return this.prisma.projectLoanApplication.findMany({
            where: { project: { onboardedById: ownerId } },
            include: PROJECT_LOAN_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }

    async getProjectLoanAppsByPartner(loanPartnerId: string) {
        return this.prisma.projectLoanApplication.findMany({
            where: {
                OR: [
                    { assignedLoanPartnerId: loanPartnerId },
                    { project: { assignedTo: { some: { id: loanPartnerId } } } }
                ]
            },
            include: PROJECT_LOAN_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }

    async getProjectLoanAppById(id: string, requesterId?: string, isLoanPartner?: boolean) {
        const app = await this.prisma.projectLoanApplication.findUnique({
            where: { id },
            include: {
                ...PROJECT_LOAN_INCLUDE,
                project: {
                    ...PROJECT_LOAN_INCLUDE.project,
                    include: { assignedTo: true }
                }
            },
        });
        if (!app) throw new NotFoundException('Project loan application not found');

        if (isLoanPartner) {
            const isDirectlyAssigned = app.assignedLoanPartnerId === requesterId;
            const isAssignedViaProject = app.project.assignedTo?.some(u => u.id === requesterId);
            if (!isDirectlyAssigned && !isAssignedViaProject) {
                throw new ForbiddenException('You are not assigned to this project loan application');
            }
        }

        return app;
    }

    async updateProjectLoanReview(id: string, dto: UpdateProjectLoanReviewDto, requesterId: string, isLoanPartner: boolean) {
        const app = await this.getProjectLoanAppById(id, requesterId, isLoanPartner);

        return this.prisma.projectLoanApplication.update({
            where: { id },
            data: {
                reviewStatus: dto.reviewStatus,
                bankStatus: dto.bankStatus,
                remarks: dto.remarks,
            },
            include: PROJECT_LOAN_INCLUDE,
        });
    }

    async assignProjectLoanPartner(id: string, dto: AssignProjectLoanPartnerDto) {
        const app = await this.prisma.projectLoanApplication.findUnique({ where: { id } });
        if (!app) throw new NotFoundException('Project loan application not found');

        return this.prisma.projectLoanApplication.update({
            where: { id },
            data: { assignedLoanPartnerId: dto.assignedLoanPartnerId },
            include: PROJECT_LOAN_INCLUDE,
        });
    }

    async linkProjectLoanDocuments(id: string, dto: LinkProjectLoanDocumentsDto) {
        const app = await this.prisma.projectLoanApplication.findUnique({ where: { id } });
        if (!app) throw new NotFoundException('Project loan application not found');

        return this.prisma.projectLoanApplication.update({
            where: { id },
            data: {
                documents: { connect: dto.documentIds.map(docId => ({ id: docId })) }
            },
            include: PROJECT_LOAN_INCLUDE,
        });
    }
}
