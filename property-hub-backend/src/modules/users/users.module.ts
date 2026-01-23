import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { PrismaService } from '../../database/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    controllers: [UsersController, InvitationController],
    providers: [UsersService, InvitationService, PrismaService],
    exports: [InvitationService],
})
export class UsersModule { }
