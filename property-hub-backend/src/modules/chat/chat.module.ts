import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatPermissionsService } from './chat.permissions';
import { PrismaService } from '../../database/prisma.service';

@Module({
    controllers: [ChatController],
    providers: [ChatService, ChatPermissionsService, PrismaService],
    exports: [ChatService],
})
export class ChatModule { }
