import {
    Injectable,
    ConflictException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateWebhookLeadDto,
    UpdateLeadStatusDto,
    NotificationDto,
    UpdateCampaignMetricsDto,
} from './webhooks.dto';
import { Lead, MarketingCampaign } from '@prisma/client';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Create a lead from webhook with duplicate prevention and auto-assignment
     */
    async createLead(
        dto: CreateWebhookLeadDto,
        idempotencyKey?: string,
    ): Promise<{
        success: boolean;
        data: Lead;
        message: string;
    }> {
        const startTime = Date.now();

        try {
            // Check idempotency
            if (idempotencyKey) {
                const existingLog = await this.prisma.webhookLog.findUnique({
                    where: { idempotencyKey },
                });

                if (existingLog) {
                    this.logger.log(
                        `Idempotent request detected: ${idempotencyKey}`,
                    );
                    return {
                        success: true,
                        data: existingLog.responseBody as unknown as Lead,
                        message: 'Lead already created (idempotent)',
                    };
                }
            }

            // Check for duplicate lead (phone)
            const existingLead = await this.prisma.lead.findFirst({
                where: {
                    phone: dto.phone,
                },
            });

            if (existingLead) {
                throw new ConflictException({
                    success: false,
                    error: 'DUPLICATE_LEAD',
                    message: 'Lead with this phone number already exists',
                    existingLeadId: existingLead.id,
                });
            }

            // Auto-assign logic could be added here based on other criteria
            let assignedTo: string | undefined;


            // Create the lead
            const { projectId, campaignId, assignedTo: dtoAssignedTo, ...rest } = dto;
            const lead = await this.prisma.lead.create({
                data: {
                    ...rest,
                    source: dto.source || 'webhook',
                    status: 'NEW',
                    assignedToUser: (dtoAssignedTo || assignedTo) ? { connect: { id: dtoAssignedTo || assignedTo } } : undefined,
                    project: projectId ? { connect: { id: projectId } } : undefined,
                    campaign: campaignId ? { connect: { id: campaignId } } : undefined,
                },
                include: {
                    project: true,
                    campaign: true,
                },
            });

            // Log webhook execution
            const executionTime = Date.now() - startTime;
            await this.logWebhookExecution(
                'POST',
                '/webhooks/leads',
                idempotencyKey,
                dto,
                201,
                lead,
                executionTime,
            );

            this.logger.log(
                `Lead created successfully: ${lead.id} in ${executionTime}ms`,
            );

            return {
                success: true,
                data: lead,
                message: 'Lead created successfully',
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            await this.logWebhookExecution(
                'POST',
                '/webhooks/leads',
                idempotencyKey,
                dto,
                error.status || 500,
                null,
                executionTime,
                error.message,
            );
            throw error;
        }
    }

    /**
     * Update lead status from webhook
     */
    async updateLeadStatus(
        id: string,
        dto: UpdateLeadStatusDto,
    ): Promise<{
        success: boolean;
        data: Lead;
    }> {
        const startTime = Date.now();

        try {
            const lead = await this.prisma.lead.findUnique({
                where: { id },
            });

            if (!lead) {
                throw new NotFoundException({
                    success: false,
                    error: 'LEAD_NOT_FOUND',
                    message: `Lead with ID ${id} not found`,
                });
            }

            const updatedLead = await this.prisma.lead.update({
                where: { id },
                data: {
                    status: dto.status,
                    notes: dto.notes
                        ? `${lead.notes || ''}\n${dto.notes}`.trim()
                        : lead.notes,
                },
                include: {

                    project: true,
                },
            });

            const executionTime = Date.now() - startTime;
            await this.logWebhookExecution(
                'PATCH',
                `/webhooks/leads/${id}/status`,
                undefined,
                dto,
                200,
                updatedLead,
                executionTime,
            );

            this.logger.log(
                `Lead status updated: ${id} -> ${dto.status} in ${executionTime}ms`,
            );

            return {
                success: true,
                data: updatedLead,
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            await this.logWebhookExecution(
                'PATCH',
                `/webhooks/leads/${id}/status`,
                undefined,
                dto,
                error.status || 500,
                null,
                executionTime,
                error.message,
            );
            throw error;
        }
    }

    /**
     * Handle notifications from n8n workflows
     */
    async handleNotification(
        dto: NotificationDto,
    ): Promise<{
        success: boolean;
        message: string;
    }> {
        const startTime = Date.now();

        try {
            // Process notification based on type
            switch (dto.type) {
                case 'lead_follow_up_reminder':
                    if (dto.leadId) {
                        // Add note to lead about reminder being sent
                        await this.prisma.lead.update({
                            where: { id: dto.leadId },
                            data: {
                                notes: dto.message
                                    ? `${dto.message} (Reminder sent at: ${new Date().toISOString()})`
                                    : `Reminder sent at: ${new Date().toISOString()}`,
                            },
                        });
                    }
                    break;

                case 'campaign_alert':
                    // Log campaign alert
                    this.logger.warn(`Campaign Alert: ${dto.message}`);
                    break;

                case 'task_completion':
                    // Log task completion
                    this.logger.log(`Task Completed: ${dto.message}`);
                    break;

                default:
                    this.logger.log(`Notification received: ${dto.type} - ${dto.message}`);
            }

            const executionTime = Date.now() - startTime;
            await this.logWebhookExecution(
                'POST',
                '/webhooks/notifications',
                undefined,
                dto,
                200,
                { processed: true },
                executionTime,
            );

            this.logger.log(
                `Notification processed: ${dto.type} in ${executionTime}ms`,
            );

            return {
                success: true,
                message: 'Notification received and processed',
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            await this.logWebhookExecution(
                'POST',
                '/webhooks/notifications',
                undefined,
                dto,
                error.status || 500,
                null,
                executionTime,
                error.message,
            );
            throw error;
        }
    }

    /**
     * Update campaign metrics from webhook
     */
    async updateCampaignMetrics(
        dto: UpdateCampaignMetricsDto,
    ): Promise<{
        success: boolean;
        data: MarketingCampaign;
    }> {
        const startTime = Date.now();

        try {
            const campaign = await this.prisma.marketingCampaign.findUnique({
                where: { id: dto.campaignId },
            });

            if (!campaign) {
                throw new NotFoundException({
                    success: false,
                    error: 'CAMPAIGN_NOT_FOUND',
                    message: `Campaign with ID ${dto.campaignId} not found`,
                });
            }

            // Update campaign metrics
            const updatedCampaign = await this.prisma.marketingCampaign.update({
                where: { id: dto.campaignId },
                data: {
                    impressions: dto.impressions ?? campaign.impressions,
                    clicks: dto.clicks ?? campaign.clicks,
                    leadsCount: dto.leadsCount ?? campaign.leadsCount,
                    conversions: dto.conversions ?? campaign.conversions,
                    spent: dto.spent ?? campaign.spent,
                },
            });

            const executionTime = Date.now() - startTime;
            await this.logWebhookExecution(
                'POST',
                '/webhooks/campaign-metrics',
                undefined,
                dto,
                200,
                updatedCampaign,
                executionTime,
            );

            this.logger.log(
                `Campaign metrics updated: ${dto.campaignId} in ${executionTime}ms`,
            );

            return {
                success: true,
                data: updatedCampaign,
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            await this.logWebhookExecution(
                'POST',
                '/webhooks/campaign-metrics',
                undefined,
                dto,
                error.status || 500,
                null,
                executionTime,
                error.message,
            );
            throw error;
        }
    }

    /**
     * Log webhook execution for monitoring and debugging
     */
    private async logWebhookExecution(
        method: string,
        endpoint: string,
        idempotencyKey: string | undefined,
        requestPayload: any,
        responseStatus: number,
        responseBody: any,
        executionTimeMs: number,
        errorMessage?: string,
    ): Promise<void> {
        try {
            await this.prisma.webhookLog.create({
                data: {
                    method,
                    endpoint,
                    idempotencyKey,
                    requestPayload: requestPayload || {},
                    responseStatus,
                    responseBody: responseBody || {},
                    executionTimeMs,
                    errorMessage,
                },
            });
        } catch (error) {
            this.logger.error(
                `Failed to log webhook execution: ${error.message}`,
            );
        }
    }
}
