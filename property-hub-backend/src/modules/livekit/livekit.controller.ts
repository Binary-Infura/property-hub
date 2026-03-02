import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/livekit')
@UseGuards(JwtAuthGuard)
export class LivekitController {
    constructor(private readonly livekitService: LivekitService) { }

    @Get('token/:roomName')
    async getToken(
        @Param('roomName') roomName: string,
        @CurrentUser() user: AuthenticatedUser
    ) {
        const participantName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || user.userId;
        const token = await this.livekitService.generateToken(roomName, participantName);
        return { token };
    }

    @Get('public-token/:roomName')
    @Public()
    async getPublicToken(@Param('roomName') roomName: string) {
        // Generic name for the lead joining via public link
        const participantName = `Lead-${Math.random().toString(36).substring(7)}`;
        const token = await this.livekitService.generateToken(roomName, participantName);
        return { token };
    }
}
