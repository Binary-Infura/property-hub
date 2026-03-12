import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadNotesService } from '../lead-notes/lead-notes.service';
import { ExotelModule } from '../exotel/exotel.module';
import { DatabaseModule } from '../../database/database.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { MailModule } from '../mail/mail.module';
import { ActivityLogsModule } from '../activity-logs/activity-logs.module';

@Module({
    imports: [ExotelModule, DatabaseModule, WhatsappModule, MailModule, ActivityLogsModule],
    controllers: [LeadsController],
    providers: [LeadsService, LeadNotesService],
})
export class LeadsModule { }
