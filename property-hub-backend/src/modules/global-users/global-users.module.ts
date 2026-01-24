import { Module } from '@nestjs/common';
import { GlobalUsersService } from './global-users.service';
import { GlobalUsersController } from './global-users.controller';
import { PrismaService } from '../../database/prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [GlobalUsersController],
    providers: [GlobalUsersService, PrismaService],
})
export class GlobalUsersModule { }
