const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ChatParticipant {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface ChatSessionResponse {
    id: string;
    mattermostChannelId: string;
    mattermostWebSocketUrl: string;
    mattermostToken: string;
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

    /**
     * Create a WebSocket connection to Mattermost
     */
    createWebSocketConnection(wsUrl: string, token: string): WebSocket {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            // Authenticate with token
            ws.send(JSON.stringify({
                seq: 1,
                action: 'authentication_challenge',
                data: { token },
            }));
        };

        return ws;
    },

    /**
     * Send a message through the Mattermost API
     */
    async sendMessage(
        channelId: string,
        message: string,
        mattermostToken: string,
        mattermostUrl: string = 'http://localhost:8065'
    ): Promise<ChatMessage> {
        const response = await fetch(`${mattermostUrl}/api/v4/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${mattermostToken}`,
            },
            body: JSON.stringify({
                channel_id: channelId,
                message,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send message');
        }

        return response.json();
    },

    /**
     * Get channel messages from Mattermost
     */
    async getChannelMessages(
        channelId: string,
        mattermostToken: string,
        mattermostUrl: string = 'http://localhost:8065',
        options?: { page?: number; perPage?: number }
    ): Promise<{ order: string[]; posts: Record<string, ChatMessage> }> {
        const page = options?.page || 0;
        const perPage = options?.perPage || 30;

        const response = await fetch(
            `${mattermostUrl}/api/v4/channels/${channelId}/posts?page=${page}&per_page=${perPage}`,
            {
                headers: {
                    Authorization: `Bearer ${mattermostToken}`,
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to get messages');
        }

        return response.json();
    },
};
