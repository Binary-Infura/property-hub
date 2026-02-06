import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../../database/prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [WebhooksController],
    providers: [WebhooksService, PrismaService],
    exports: [WebhooksService],
})
export class WebhooksModule { }
