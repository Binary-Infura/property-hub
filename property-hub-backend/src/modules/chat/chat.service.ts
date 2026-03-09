import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ChatPermissionsService } from './chat.permissions';
import { StartChatDto, ChatSessionResponseDto, ChatParticipantDto, MyChatSessionDto } from './chat.dto';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        private prisma: PrismaService,
        private chatPermissions: ChatPermissionsService,
    ) { }

    /**
     * Start or resume a chat session
     */
    async startChat(userId: string, dto: StartChatDto): Promise<ChatSessionResponseDto> {
        this.logger.log(`User ${userId} starting chat with participant ${dto.participantId}`);

        // Validate participant ID is provided
        if (!dto.participantId) {
            throw new BadRequestException('Participant ID is required');
        }

        // Validate permission to start chat
        await this.chatPermissions.validateCanStartChat(userId, dto.participantId);

        // Get both users
        const [currentUser, targetUser] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: userId } }),
            this.prisma.user.findUnique({ where: { id: dto.participantId } }),
        ]);

        if (!currentUser || !targetUser) {
            throw new NotFoundException('User not found');
        }

        // Derive context from DTO
        const contextType = dto.projectId ? 'PROPERTY' : dto.leadId ? 'LEAD' : dto.contextType;
        const contextId = dto.projectId || dto.leadId;

        // Check if chat session already exists between these users
        const existingSession = await this.findExistingChatSession(userId, dto.participantId, contextType, contextId);

        if (existingSession) {
            this.logger.log(`Found existing chat session: ${existingSession.id}`);
            return this.buildChatSessionResponse(existingSession.id, currentUser.id);
        }

        // Create chat session in database
        const chatSession = await this.prisma.chatSession.create({
            data: {
                channelType: 'DIRECT',
                contextType: contextType,
                contextId: contextId,
                participants: {
                    create: [
                        {
                            userId: currentUser.id,
                            role: currentUser.defaultRole || currentUser.roles[0],
                        },
                        {
                            userId: targetUser.id,
                            role: targetUser.defaultRole || targetUser.roles[0],
                        },
                    ],
                },
            },
            include: {
                participants: true,
            },
        });

        this.logger.log(`Created new chat session: ${chatSession.id}`);

        return this.buildChatSessionResponse(chatSession.id, currentUser.id);
    }

    /**
     * Get chat session details
     */
    async getChatSession(userId: string, chatSessionId: string): Promise<ChatSessionResponseDto> {
        // Validate access
        await this.chatPermissions.validateCanAccessChat(userId, chatSessionId);

        return this.buildChatSessionResponse(chatSessionId, userId);
    }

    /**
     * Get all chat sessions for a user
     */
    async getMyChatSessions(userId: string): Promise<MyChatSessionDto[]> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        let chatSessions;

        // Regular users see only their own chats
        chatSessions = await this.prisma.chatSession.findMany({
            where: {
                participants: {
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        chatSession: true
                    }
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        const result: MyChatSessionDto[] = [];

        for (const session of chatSessions) {
            const participantUserIds = session.participants.map(p => p.userId).filter(id => id !== userId);
            const participants = await this.prisma.user.findMany({
                where: { id: { in: participantUserIds } },
            });

            result.push({
                id: session.id,
                channelType: session.channelType,
                contextType: session.contextType || undefined,
                contextId: session.contextId || undefined,
                participants: participants.map(p => ({
                    id: p.id,
                    name: `${p.firstName} ${p.lastName || ''}`.trim(),
                    email: p.email,
                    roles: p.roles,
                })),
                lastMessageAt: session.updatedAt,
                unreadCount: 0,
            });
        }

        return result;
    }

    /**
     * Find existing chat session between users
     */
    private async findExistingChatSession(
        userId1: string,
        userId2: string,
        contextType?: string,
        contextId?: string
    ) {
        const sessions = await this.prisma.chatSession.findMany({
            where: {
                AND: [
                    {
                        participants: {
                            some: { userId: userId1 },
                        },
                    },
                    {
                        participants: {
                            some: { userId: userId2 },
                        },
                    },
                    contextType ? { contextType } : {},
                    contextId ? { contextId } : {},
                ],
            },
            include: {
                participants: true,
            },
        });

        // Return session with exactly 2 participants (direct chat)
        return sessions.find(s => s.participants.length === 2);
    }

    /**
     * Build chat session response DTO
     */
    private async buildChatSessionResponse(
        chatSessionId: string,
        currentUserId: string
    ): Promise<ChatSessionResponseDto> {
        const chatSession = await this.prisma.chatSession.findUnique({
            where: { id: chatSessionId },
            include: {
                participants: true,
            },
        });

        if (!chatSession) {
            throw new NotFoundException('Chat session not found');
        }

        // Get participant user details
        const participantUserIds = chatSession.participants.map(p => p.userId);
        const participants = await this.prisma.user.findMany({
            where: { id: { in: participantUserIds } },
        });

        return {
            id: chatSession.id,
            channelType: chatSession.channelType,
            contextType: chatSession.contextType || undefined,
            contextId: chatSession.contextId || undefined,
            participants: participants.map(p => ({
                id: p.id,
                name: `${p.firstName} ${p.lastName || ''}`.trim(),
                email: p.email,
                roles: p.roles,
            })),
            createdAt: chatSession.createdAt,
        };
    }
}
return {
            id: chatSession.id