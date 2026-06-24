import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationType } from '../../common/enums/organization-type.enum';
import { UserRole } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Get()
    @Public()
    findAll(@Query('type') type?: OrganizationType) {
        return this.organizationsService.findAll(type);
    }

    @Get(':id/members')
    @Public()
    findMembers(
        @Param('id') id: string,
        @Query('role') role?: UserRole
    ) {
        return this.organizationsService.findMembers(id, role);
    }
}
