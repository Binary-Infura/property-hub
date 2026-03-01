import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadNotesService } from '../lead-notes/lead-notes.service';

@Module({
    controllers: [LeadsController],
    providers: [LeadsService, LeadNotesService],
})
export class LeadsModule { }
