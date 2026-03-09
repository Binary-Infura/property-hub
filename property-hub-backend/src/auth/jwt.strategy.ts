import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
        });
    }

    async validate(payload: any): Promise<AuthenticatedUser> {
        // The payload usually contains 'sub' as ID, 'email', 'roles', etc.
        const userId = payload.sub || payload.id;

        if (!userId) {
            throw new UnauthorizedException('Invalid token payload');
        }

        return {
            userId: userId,
            email: payload.email,
            username: payload.preferred_username || payload.email,
            firstName: payload.firstName || payload.given_name,
            lastName: payload.lastName || payload.family_name,
            roles: payload.realm_access?.roles || payload.roles || [],
            groups: payload.groups || [],
            phone: payload.phone,
        };
    }
}
