import { Module } from '@nestjs/common';
import { CentralAuthorityService } from './central-authority.service';
import { CentralAuthorityController } from './central-authority.controller';
import { PrismaService } from '../../../database/prisma.service';
import { UsersModule } from '../../users/users.module';
@Module({
    imports: [UsersModule],
    controllers: [CentralAuthorityController],
    providers: [CentralAuthorityService, PrismaService],
    exports: [CentralAuthorityService],
})
export class CentralAuthorityModule { }
