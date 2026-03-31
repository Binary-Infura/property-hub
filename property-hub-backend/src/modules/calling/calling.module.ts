import { Module, Global } from '@nestjs/common';
import { CallingService } from './calling.service';
import { CallingController } from './calling.controller';
import { ExotelBusinessProvider } from './providers/exotel.provider';
import { KnowlarityProvider } from './providers/knowlarity.provider';
import { TwilioProvider } from './providers/twilio.provider';
import { PrismaService } from '../../database/prisma.service';

@Global()
@Module({
    controllers: [CallingController],
    providers: [
        CallingService,
        ExotelBusinessProvider,
        KnowlarityProvider,
        TwilioProvider,
        PrismaService
    ],
    exports: [CallingService],
})
export class CallingModule { }
