import { Module } from '@nestjs/common';
import { RegionalManagersService } from './regional-managers.service';
import { RegionalManagersController } from './regional-managers.controller';
import { PrismaService } from '../../database/prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [RegionalManagersController],
    providers: [RegionalManagersService, PrismaService],
})
export class RegionalManagersModule { }
