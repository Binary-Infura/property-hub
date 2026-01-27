import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserMetadataDto, CreateUserDto, UpdateUserDto, InviteUserDto, InviteCentralAuthorityDto, InvitationResponse } from './users.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RegionGuard } from '../../auth/guards/region.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { RequireRegion } from '../../common/decorators/require-region.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    getMyMetadata(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.getUserMetadata(user.userId);
    }

    @Get('me/profile-status')
    getMyProfileStatus(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.getProfileStatus(user.userId, user.roles);
    }

    @Patch('me')
    updateMyMetadata(
        @CurrentUser() user: AuthenticatedUser,
        @Body() updateUserMetadataDto: UpdateUserMetadataDto,
    ) {
        return this.usersService.updateUserMetadata(user.userId, updateUserMetadataDto);
    }

    // --- User Invitation Endpoints ---

    /**
     * Invite a user to a specific region with roles
     * Requires regional-manager role in the target region
     */
    @Post('invite/:region')
    @UseGuards(RolesGuard, RegionGuard)
    @RequireRegion()
    @RequireRoles('regional-manager')
    async inviteUserToRegion(
        @Param('region') region: string,
        @Body() dto: InviteUserDto,
    ): Promise<InvitationResponse> {
        return this.usersService.inviteUser(dto);
    }

    /**
     * Invite a central authority user
     * Only accessible by existing central authority users
     */
    @RequireRoles('central-authority')
    @UseGuards(RolesGuard)
    @Post('invite-central')
    async inviteCentralAuthority(
        @Body() dto: InviteCentralAuthorityDto,
    ): Promise<InvitationResponse> {
        return this.usersService.inviteCentralAuthorityUser(dto);
    }

    // Role-based User Management

    @Post()
    @UseGuards(JwtAuthGuard)
    async createUser(
        @Body() dto: CreateUserDto,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.usersService.createUser(dto, user);
    }

    @Get('role/:role')
    async findAllByRole(
        @Param('role') role: string,
        @Query('region') region?: string,
        @Query('myOnly') myOnly?: string,
        @CurrentUser() user?: AuthenticatedUser
    ) {
        return this.usersService.findAllByRole(role, region, myOnly === 'true', user);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(id, dto);
    }

    @Patch(':id/toggle-status')
    async toggleStatus(@Param('id') id: string) {
        return this.usersService.toggleStatus(id);
    }
}
