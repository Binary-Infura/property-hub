import { Module } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { BrokerController } from './broker.controller';
import { PrismaService } from '../../../database/prisma.service';

@Module({
    controllers: [BrokerController],
    providers: [BrokerService, PrismaService],
    exports: [BrokerService],
})
export class BrokerModule { }
