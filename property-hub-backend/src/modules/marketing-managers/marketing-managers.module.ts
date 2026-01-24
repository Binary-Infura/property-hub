import { Module } from '@nestjs/common';
import { MarketingManagersService } from './marketing-managers.service';
import { MarketingManagersController } from './marketing-managers.controller';
import { PrismaService } from '../../database/prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [MarketingManagersController],
    providers: [MarketingManagersService, PrismaService],
})
export class MarketingManagersModule { }
