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

@Controller('api/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles('central-authority', 'regional-manager', 'marketing-manager', 'onboarding-manager', 'property-partner', 'channel-partner', 'consultant')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    @Get()
    @RequireRoles('central-authority', 'regional-manager', 'marketing-manager')
    findAll(
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.findAll(user);
    }

    @Get(':id')
    @RequireRoles('central-authority', 'regional-manager', 'marketing-manager')
    findOne(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.findOne(id, user);
    }

    @Post()
    @RequireRoles('central-authority', 'regional-manager', 'marketing-manager')
    create(
        @Body() createLeadDto: CreateLeadDto
    ) {
        return this.leadsService.create(createLeadDto);
    }

    @Post('bulk')
    @RequireRoles('central-authority', 'regional-manager', 'marketing-manager')
    bulkCreate(
        @Body() bulkCreateLeadsDto: { leads: CreateLeadDto[] }
    ) {
        return this.leadsService.createMany(bulkCreateLeadsDto.leads);
    }

    @Patch(':id')
    @RequireRoles('central-authority', 'regional-manager', 'marketing-manager')
    update(
        @Param('id') id: string,
        @Body() updateLeadDto: UpdateLeadDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.leadsService.update(id, updateLeadDto, user);
    }

    @Delete(':id')
    @RequireRoles('central-authority', 'regional-manager', 'marketing-manager')
    remove(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.leadsService.remove(id, user);
    }
}
