import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { StartChatDto, ChatSessionResponseDto, MyChatSessionDto } from './chat.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    /**
     * Start or resume a chat session
     * POST /api/chat/start
     */
    @Post('start')
    async startChat(
        @Req() req: any,
        @Body() startChatDto: StartChatDto
    ): Promise<ChatSessionResponseDto> {
        const userId = req.user.sub;
        return this.chatService.startChat(userId, startChatDto);
    }

    /**
     * Get chat session details
     * GET /api/chat/:id
     */
    @Get(':id')
    async getChatSession(
        @Req() req: any,
        @Param('id') chatSessionId: string
    ): Promise<ChatSessionResponseDto> {
        const userId = req.user.sub;
        return this.chatService.getChatSession(userId, chatSessionId);
    }

    /**
     * Get all chat sessions for the current user
     * GET /api/chat/my-chats
     */
    @Get('my-chats')
    async getMyChatSessions(@Req() req: any): Promise<MyChatSessionDto[]> {
        const userId = req.user.sub;
        return this.chatService.getMyChatSessions(userId);
    }
}
