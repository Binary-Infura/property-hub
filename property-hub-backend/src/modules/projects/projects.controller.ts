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
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.GROWTH_PARTNER, UserRole.PROPERTY_PARTNER, UserRole.CONSULTANT, UserRole.BUYER, UserRole.LOAN_PARTNER)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get('my')
    findAllMy(
        @CurrentUser() user: AuthenticatedUser,
        @Query('city') city?: string,
        @Query('status') status?: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string,
    ) {
        return this.projectsService.findAll(user, true, city, status, Number(page), Number(limit), search);
    }

    @Get()
    @Public()
    findAll(
        @CurrentUser() user: AuthenticatedUser,
        @Query('city') city?: string,
        @Query('status') status?: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string,
    ) {
        return this.projectsService.findAll(user, false, city, status, Number(page), Number(limit), search);
    }

    @Get(':id')
    @Public()
    findOne(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.projectsService.findOne(id, user);
    }

    @Post()
    @RequireRoles(UserRole.PROPERTY_PARTNER)
    create(
        @Body() createProjectDto: CreateProjectDto,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.projectsService.create(createProjectDto, user);
    }

    @Patch(':id')
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    update(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.projectsService.update(id, updateProjectDto, user);
    }

    @Delete(':id')
    @RequireRoles(UserRole.PROPERTY_PARTNER)
    remove(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.projectsService.remove(id, user);
    }

    @Post(':id/assign-consultants')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.PROPERTY_PARTNER)
    assignConsultants(
        @Param('id') id: string,
        @Body('consultantIds') consultantIds: string[],
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.projectsService.assignConsultants(id, consultantIds, user);
    }

    @Post('bulk-assign-consultants')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.PROPERTY_PARTNER)
    bulkAssignConsultants(
        @Body('projectIds') projectIds: string[],
        @Body('consultantIds') consultantIds: string[],
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.projectsService.bulkAssignConsultants(projectIds, consultantIds, user);
    }
}
