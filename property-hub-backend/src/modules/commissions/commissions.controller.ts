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
import { CommissionsService } from './commissions.service';
import { CreateCommissionDto, UpdateCommissionDto } from './commissions.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/commissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(UserRole.CENTRAL_AUTHORITY, UserRole.MARKETING_MANAGER, UserRole.ONBOARDING_MANAGER, UserRole.PROPERTY_PARTNER, UserRole.BROKER, UserRole.CONSULTANT)
export class CommissionsController {
    constructor(private readonly commissionsService: CommissionsService) { }

    @Get()
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    findAll(
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.findAll(user);
    }

    @Get(':id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    findOne(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.findOne(id, user);
    }

    @Post()
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    create(
        @Body() createCommissionDto: CreateCommissionDto,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.create(createCommissionDto, user);
    }

    @Patch(':id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    update(
        @Param('id') id: string,
        @Body() updateCommissionDto: UpdateCommissionDto,
        @CurrentUser() user: AuthenticatedUser,
    ) {
        return this.commissionsService.update(id, updateCommissionDto, user);
    }

    @Delete(':id')
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    remove(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.commissionsService.remove(id, user);
    }
}
