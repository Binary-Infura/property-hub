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
import { TowersService } from './towers.service';
import { CreateTowerDto, UpdateTowerDto } from './towers.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/towers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TowersController {
    constructor(private readonly towersService: TowersService) { }

    @Post()
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    create(@Body() createTowerDto: CreateTowerDto, @CurrentUser() user: AuthenticatedUser) {
        return this.towersService.create(createTowerDto, user);
    }

    @Get('project/:projectId')
    @Public()
    findByProject(@Param('projectId') projectId: string) {
        return this.towersService.findByProject(projectId);
    }

    @Get(':id')
    @Public()
    findOne(@Param('id') id: string) {
        return this.towersService.findOne(id);
    }

    @Patch(':id')
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    update(
        @Param('id') id: string,
        @Body() updateTowerDto: UpdateTowerDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.towersService.update(id, updateTowerDto, user);
    }

    @Delete(':id')
    @RequireRoles(UserRole.PROPERTY_PARTNER, UserRole.CENTRAL_AUTHORITY)
    remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
        return this.towersService.remove(id, user);
    }
}
