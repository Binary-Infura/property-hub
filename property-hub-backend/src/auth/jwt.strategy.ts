import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { JwtPayload, AuthenticatedUser, RegionRoles } from '../common/interfaces/jwt-payload.interface';

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
            audience: clientId,
            issuer: keycloakRealmUrl,
            algorithms: ['RS256'],
        });
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        if (!payload || !payload.sub) {
            throw new UnauthorizedException('Invalid token payload');
        }

        // Extract realm roles - only 'buyer' or 'internal'
        const realmRoles = payload.realm_access?.roles || [];
        const realmRole: 'buyer' | 'internal' = realmRoles.includes('internal') ? 'internal' : 'buyer';

        // Extract regions from JWT (mapped from Keycloak user attribute)
        const regionRoles = payload.regions || {};

        // Check if user is central authority
        // Central authority has 'all' region with 'central-authority' role
        const isCentralAuthority = regionRoles['all']?.roles?.includes('central-authority') || false;

        return {
            userId: payload.sub,
            email: payload.email,
            username: payload.preferred_username,
            realmRole,
            regionRoles,
            isCentralAuthority,
        };
    }
}
