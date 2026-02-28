import {
    IsString,
    IsOptional,
    IsEnum,
    IsUUID,
    IsEmail,
    IsInt,
    IsNumber,
    Min,
    IsObject,
    IsDateString,
} from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class CreateWebhookLeadDto {
    @IsString()
    name: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    phone: string;

    @IsUUID()
    @IsOptional()
    assignedTo?: string;


    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsString()
    @IsOptional()
    source?: string;

    @IsUUID()
    @IsOptional()
    campaignId?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}

export class UpdateLeadStatusDto {
    @IsEnum(LeadStatus)
    status: LeadStatus;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class NotificationDto {
    @IsString()
    type: string; // e.g., 'lead_follow_up_reminder', 'campaign_alert', 'task_completion'

    @IsString()
    message: string;

    @IsUUID()
    @IsOptional()
    leadId?: string;

    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}

export class UpdateCampaignMetricsDto {
    @IsUUID()
    campaignId: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    impressions?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    clicks?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    leadsCount?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    conversions?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    spent?: number;

    @IsDateString()
    @IsOptional()
    date?: string;
}
