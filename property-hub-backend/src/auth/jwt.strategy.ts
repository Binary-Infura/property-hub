import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { JwtPayload, AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        const keycloakRealmUrl = configService.get<string>('KEYCLOAK_REALM_URL');
        const clientId = configService.get<string>('KEYCLOAK_CLIENT_ID');

        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${keycloakRealmUrl}/protocol/openid-connect/certs`,
            }),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            algorithms: ['RS256'],
        });
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        const userId = payload.sub || payload.email || payload.preferred_username;

        if (!userId) {
            throw new UnauthorizedException('Invalid token payload: missing sub, email, or preferred_username');
        }

        return {
            userId: userId,
            email: payload.email,
            username: payload.preferred_username,
            roles: payload.realm_access?.roles || [],
            groups: payload.groups || [],
        };
    }
}
