import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { InstagramController } from './instagram.controller';
import { PrismaService } from '../../database/prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [InstagramController],
    providers: [InstagramService, PrismaService],
    exports: [InstagramService],
})
export class InstagramModule {}
