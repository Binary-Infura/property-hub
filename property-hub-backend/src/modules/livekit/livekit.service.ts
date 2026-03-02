import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
    private readonly apiKey: string;
    private readonly apiSecret: string;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
        this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    }

    async generateToken(roomName: string, participantName: string) {
        if (!this.apiKey || !this.apiSecret) {
            throw new Error('LiveKit credentials not configured');
        }

        const at = new AccessToken(this.apiKey, this.apiSecret, {
            identity: participantName,
        });

        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true,
        });

        return at.toJwt();
    }
}
