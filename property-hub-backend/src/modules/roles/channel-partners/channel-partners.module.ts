import { Module } from '@nestjs/common';
import { ChannelPartnersService } from './channel-partners.service';
import { ChannelPartnersController } from './channel-partners.controller';
import { PrismaService } from '../../../database/prisma.service';

@Module({
    controllers: [ChannelPartnersController],
    providers: [ChannelPartnersService, PrismaService],
    exports: [ChannelPartnersService],
})
export class ChannelPartnersModule { }
