import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserMetadataDto, CreateUserDto, UpdateUserDto, InviteUserDto, InviteCentralAuthorityDto, InvitationResponse, UpdateProfileDto } from './users.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

import { Public } from '../../common/decorators/public.decorator';

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

    @Patch('profile')
    updateProfile(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.usersService.updateMyProfile(user.userId, user.roles, dto);
    }

    // --- User Invitation Endpoints ---

    /**
     * Invite a user with roles
     */
    @Post('invite')
    @UseGuards(RolesGuard)
    @RequireRoles('central-authority')
    async inviteUser(
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
        @Query('myOnly') myOnly?: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @CurrentUser() user?: AuthenticatedUser
    ) {
        return this.usersService.findAllByRole(
            role,
            myOnly === 'true',
            user,
            Number(page),
            Number(limit)
        );
    }

    @Get(':id')
    @Public()
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
    @Post(':id/follow')
    @UseGuards(RolesGuard)
    @RequireRoles('buyer')
    async follow(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.usersService.follow(user.userId, id);
    }

    @Post(':id/unfollow')
    @UseGuards(RolesGuard)
    @RequireRoles('buyer')
    async unfollow(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return this.usersService.unfollow(user.userId, id);
    }

    @Get(':id/is-following')
    @UseGuards(RolesGuard)
    @RequireRoles('buyer')
    async isFollowing(
        @Param('id') id: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        return { isFollowing: await this.usersService.isFollowing(user.userId, id) };
    }

    @Get(':id/follower-count')
    @Public()
    async getFollowerCount(@Param('id') id: string) {
        return { count: await this.usersService.getFollowerCount(id) };
    }
}
