import { IsOptional, IsString, IsUUID } from 'class-validator';

export class StartChatDto {
    @IsOptional()
    @IsUUID()
    participantId?: string; // The other user to chat with

    @IsOptional()
    @IsUUID()
    projectId?: string; // Context: specific project

    @IsOptional()
    @IsUUID()
    leadId?: string; // Context: specific lead

    @IsOptional()
    @IsString()
    contextType?: 'PROPERTY' | 'LEAD' | 'GENERAL';
}

export class ChatParticipantDto {
    id: string;
    name: string;
    email: string;
    roles: string[];
}

export class ChatSessionResponseDto {
    id: string;
    mattermostChannelId: string;
    mattermostWebSocketUrl: string;
    mattermostToken: string;
    channelType: string;
    contextType?: string;
    contextId?: string;
    participants: ChatParticipantDto[];
    createdAt: Date;
}

export class MyChatSessionDto {
    id: string;
    channelType: string;
    contextType?: string;
    contextId?: string;
    participants: ChatParticipantDto[];
    lastMessageAt?: Date;
    unreadCount?: number;
}
