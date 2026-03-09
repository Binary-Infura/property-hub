import { IsString, IsOptional, IsEnum, IsUUID, IsEmail } from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class CreateLeadDto {
    @IsString()
    name: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    phone: string;

    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsUUID()
    @IsOptional()
    campaignId?: string;

    @IsEnum(LeadStatus)
    @IsOptional()
    status?: LeadStatus;

    @IsString()
    @IsOptional()
    source?: string;

    @IsString()
    @IsOptional()
    assignedTo?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateLeadDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @IsUUID()
    @IsOptional()
    campaignId?: string;

    @IsEnum(LeadStatus)
    @IsOptional()
    status?: LeadStatus;

    @IsString()
    @IsOptional()
    source?: string;

    @IsString()
    @IsOptional()
    assignedTo?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class BulkCreateLeadsDto {
    leads: CreateLeadDto[];
}

export class SendVideoCallLinkDto {
    @IsString()
    channel: 'email' | 'whatsapp';

    @IsString()
    @IsOptional()
    videoRoomName?: string;
}

export class SendCommunicationResponse {
    success: boolean;
    message: string;
    workflowExecutionId?: string;
}
