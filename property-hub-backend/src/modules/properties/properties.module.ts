import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PrismaService } from '../../database/prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [PropertiesController],
    providers: [PropertiesService, PrismaService],
})
export class PropertiesModule { }
