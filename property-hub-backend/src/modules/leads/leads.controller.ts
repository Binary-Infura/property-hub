import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto } from './leads.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/role.enum';
import { LeadNotesService } from '../lead-notes/lead-notes.service';
import { CreateLeadNoteDto } from '../lead-notes/lead-notes.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('central-authority', 'marketing-manager', 'onboarding-manager', 'property-partner', 'channel-partner', 'consultant')
export class LeadsController {
    constructor(
        private readonly leadsService: LeadsService,
        private readonly leadNotesService: LeadNotesService
    ) { }
    // Call Logs
    @Get('calls/history')
    @RequireRoles(UserRole.CONSULTANT, UserRole.CENTRAL_AUTHORITY)
    getCallLogs(@CurrentUser() user: AuthenticatedUser) {
        return this.leadsService.getCallLogs(user);
    }

    @Get(':id/calls')
    @RequireRoles(UserRole.CONSULTANT, UserRole.CENTRAL_AUTHORITY, UserRole.MARKETING_MANAGER)
    getLeadCallLogs(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.getCallLogs(user, id);
    }


    @Get(':id')
    @RequireRoles('central-authority', 'marketing-manager')
    findOne(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.findOne(id, user);
    }

    // Lead Notes
    @Post(':id/notes')
    @RequireRoles(UserRole.CONSULTANT, UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_ADVISER)
    addNote(
        @Param('id') id: string,
        @Body() dto: CreateLeadNoteDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadNotesService.create(id, user.userId, dto);
    }

    @Get(':id/notes')
    @RequireRoles(UserRole.CONSULTANT, UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_ADVISER)
    getNotes(@Param('id') id: string) {
        return this.leadNotesService.findByLead(id);
    }

    @Delete(':id/notes/:noteId')
    @RequireRoles(UserRole.CONSULTANT, UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_ADVISER)
    removeNote(
        @Param('noteId') noteId: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadNotesService.remove(noteId, user.userId);
    }

    @Get()
    @RequireRoles('central-authority', 'marketing-manager', 'property-partner')
    findAll(
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.findAll(user);
    }

    @Post()
    @RequireRoles('central-authority', 'marketing-manager')
    create(
        @Body() createLeadDto: CreateLeadDto
    ) {
        return this.leadsService.create(createLeadDto);
    }

    @Post('public/inquire')
    @Public()
    createPublicInquiry(
        @Body() createLeadDto: CreateLeadDto
    ) {
        return this.leadsService.create(createLeadDto);
    }

    @Post('bulk')
    @RequireRoles('central-authority', 'marketing-manager')
    bulkCreate(
        @Body() bulkCreateLeadsDto: { leads: CreateLeadDto[] }
    ) {
        return this.leadsService.createMany(bulkCreateLeadsDto.leads);
    }

    @Patch(':id')
    @RequireRoles('central-authority', 'marketing-manager', 'consultant')
    update(
        @Param('id') id: string,
        @Body() updateLeadDto: UpdateLeadDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadsService.update(id, updateLeadDto, user);
    }

    @Delete(':id')
    @RequireRoles('central-authority', 'marketing-manager')
    remove(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.remove(id, user);
    }

    @Post(':id/call')
    @RequireRoles('consultant')
    initiateCall(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadsService.initiateCall(id, user);
    }
}
