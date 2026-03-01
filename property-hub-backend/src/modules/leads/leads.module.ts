import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadNotesService } from '../lead-notes/lead-notes.service';
import { ExotelModule } from '../exotel/exotel.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [ExotelModule, DatabaseModule],
    controllers: [LeadsController],
    providers: [LeadsService, LeadNotesService],
})
export class LeadsModule { }
