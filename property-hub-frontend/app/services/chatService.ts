const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ChatParticipant {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface ChatSessionResponse {
    id: string;
    channelType: string;
    contextType?: string;
    contextId?: string;
    participants: ChatParticipant[];
    createdAt: string;
}

export interface MyChatSession {
    id: string;
    channelType: string;
    contextType?: string;
    contextId?: string;
    participants: ChatParticipant[];
    lastMessageAt?: string;
    unreadCount?: number;
}

export interface ChatMessage {
    id: string;
    channelId: string;
    userId: string;
    message: string;
    createAt: number;
    updateAt: number;
    type?: string;
}

export const chatService = {
    /**
     * Start or resume a chat with another user
     */
    async startChat(
        participantId: string,
        token: string,
        options?: { propertyId?: string; leadId?: string }
    ): Promise<ChatSessionResponse> {
        const response = await fetch(`${API_URL}/api/chat/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                participantId,
                propertyId: options?.propertyId,
                leadId: options?.leadId,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to start chat');
        }

        return response.json();
    },

    /**
     * Get chat session details
     */
    async getChatSession(chatId: string, token: string): Promise<ChatSessionResponse> {
        const response = await fetch(`${API_URL}/api/chat/${chatId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to get chat session');
        }

        return response.json();
    },

    /**
     * Get all chat sessions for the current user
     */
    async getMyChatSessions(token: string): Promise<MyChatSession[]> {
        const response = await fetch(`${API_URL}/api/chat/my-chats`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to get chat sessions');
        }

        return response.json();
    },
};
