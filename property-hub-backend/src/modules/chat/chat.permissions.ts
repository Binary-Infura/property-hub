import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Permission rules for chat access
 * 
 * Rules:
 * - Buyers can chat with: consultants, property-partners, channel-partners
 * - Consultants can chat with: buyers
 * - Property Partners can chat with: buyers
 * - Channel Partners can chat with: buyers
 */

interface ChatPermissionRule {
    canChatWith: string[];
    canViewChatsOf: 'self' | 'all-in-region' | 'all';
}

const CHAT_PERMISSION_RULES: Record<string, ChatPermissionRule> = {
    'buyer': {
        canChatWith: ['consultant', 'property-partner', 'channel-partner'],
        canViewChatsOf: 'self'
    },
    'consultant': {
        canChatWith: ['buyer'],
        canViewChatsOf: 'self'
    },
    'property-partner': {
        canChatWith: ['buyer'],
        canViewChatsOf: 'self'
    },
    'channel-partner': {
        canChatWith: ['buyer'],
        canViewChatsOf: 'self'
    },
    'marketing-manager': {
        canChatWith: [],
        canViewChatsOf: 'self'
    },

};

@Injectable()
export class ChatPermissionsService {
    private readonly logger = new Logger(ChatPermissionsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Check if a user can start a chat with another user
     */
    async canStartChatWith(userId: string, targetUserId: string): Promise<boolean> {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });

            if (!user || !targetUser) {
                return false;
            }

            // Check if ANY of the user's roles allow chatting with ANY of the target user's roles
            const canChat = user.roles.some((userRole: string) => {
                const rules = CHAT_PERMISSION_RULES[userRole];
                if (!rules) return false;
                return targetUser.roles.some((targetRole: string) => rules.canChatWith.includes(targetRole));
            });

            this.logger.log(`User ${userId} (${user.roles.join(', ')}) can chat with ${targetUserId} (${targetUser.roles.join(', ')}): ${canChat}`);
            return canChat;
        } catch (error) {
            this.logger.error('Error checking chat permissions', error);
            return false;
        }
    }

    /**
     * Check if a user can access a specific chat session
     */
    async canAccessChatSession(userId: string, chatSessionId: string): Promise<boolean> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return false;
            }

            const chatSession = await this.prisma.chatSession.findUnique({
                where: { id: chatSessionId },
                include: {
                    participants: {
                        include: {
                            chatSession: true
                        }
                    }
                }
            });

            if (!chatSession) {
                return false;
            }

            // Check if user is a participant
            const isParticipant = chatSession.participants.some(p => p.userId === userId);
            if (isParticipant) {
                return true;
            }



            return false;
        } catch (error) {
            this.logger.error('Error checking chat session access', error);
            return false;
        }
    }

    /**
     * Validate and throw exception if cannot start chat
     */
    async validateCanStartChat(userId: string, targetUserId: string): Promise<void> {
        const canChat = await this.canStartChatWith(userId, targetUserId);
        if (!canChat) {
            throw new ForbiddenException('You do not have permission to start a chat with this user');
        }
    }

    /**
     * Validate and throw exception if cannot access chat session
     */
    async validateCanAccessChat(userId: string, chatSessionId: string): Promise<void> {
        const canAccess = await this.canAccessChatSession(userId, chatSessionId);
        if (!canAccess) {
            throw new ForbiddenException('You do not have permission to access this chat');
        }
    }

    /**
     * Get permission rule for a role
     */
    getPermissionRule(role: string): ChatPermissionRule | undefined {
        return CHAT_PERMISSION_RULES[role];
    }
}
