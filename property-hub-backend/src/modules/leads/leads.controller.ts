import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto, SendVideoCallLinkDto } from './leads.dto';
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
export class LeadsController {
    constructor(
        private readonly leadsService: LeadsService,
        private readonly leadNotesService: LeadNotesService
    ) { }
    // Call Logs
    @Get('calls/history')
    @RequireRoles(UserRole.CONSULTANT, UserRole.CENTRAL_AUTHORITY)
    getCallLogs(
        @CurrentUser() user: AuthenticatedUser,
        @Query('consultantId') consultantId?: string,
        @Query('projectId') projectId?: string
    ) {
        return this.leadsService.getCallLogs(user, undefined, consultantId, projectId);
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
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.MARKETING_MANAGER)
    findOne(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.findOne(id, user);
    }

    // Lead Notes
    @Post(':id/notes')
    @RequireRoles(UserRole.CONSULTANT, UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_ADVISOR)
    addNote(
        @Param('id') id: string,
        @Body() dto: CreateLeadNoteDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadNotesService.create(id, user.userId, dto);
    }

    @Get(':id/notes')
    @RequireRoles(UserRole.CONSULTANT, UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_ADVISOR)
    getNotes(@Param('id') id: string) {
        return this.leadNotesService.findByLead(id);
    }

    @Delete(':id/notes/:noteId')
    @RequireRoles(UserRole.CONSULTANT, UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY, UserRole.LOAN_ADVISOR)
    removeNote(
        @Param('noteId') noteId: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadNotesService.remove(noteId, user.userId);
    }

    @Get()
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.MARKETING_MANAGER, UserRole.PROPERTY_PARTNER, UserRole.CONSULTANT, UserRole.BUYER)
    findAll(
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.findAll(user);
    }

    @Post()
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.MARKETING_MANAGER, UserRole.CONSULTANT, UserRole.PROPERTY_PARTNER)
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
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.MARKETING_MANAGER)
    bulkCreate(
        @Body() bulkCreateLeadsDto: { leads: CreateLeadDto[] }
    ) {
        return this.leadsService.createMany(bulkCreateLeadsDto.leads);
    }

    @Patch(':id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.MARKETING_MANAGER, UserRole.CONSULTANT, UserRole.PROPERTY_PARTNER)
    update(
        @Param('id') id: string,
        @Body() updateLeadDto: UpdateLeadDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadsService.update(id, updateLeadDto, user);
    }

    @Delete(':id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.MARKETING_MANAGER)
    remove(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.remove(id, user);
    }

    @Post(':id/call')
    @RequireRoles(UserRole.CONSULTANT)
    initiateCall(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadsService.initiateCall(id, user);
    }

    @Post(':id/send-video-link')
    @RequireRoles(UserRole.CONSULTANT)
    sendVideoCallLink(
        @Param('id') id: string,
        @Body() dto: SendVideoCallLinkDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadsService.sendVideoCallLink(id, dto, user);
    }

    @Post(':id/generate-video-room')
    @RequireRoles(UserRole.CONSULTANT)
    generateVideoRoom(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadsService.generateVideoCallRoom(id, user);
    }
}
