import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserMetadataDto } from './users.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    getMyMetadata(@CurrentUser() user: AuthenticatedUser) {
        return this.usersService.getUserMetadata(user.userId);
    }

    @Patch('me')
    updateMyMetadata(
        @CurrentUser() user: AuthenticatedUser,
        @Body() updateUserMetadataDto: UpdateUserMetadataDto,
    ) {
        return this.usersService.updateUserMetadata(user.userId, updateUserMetadataDto);
    }
}
