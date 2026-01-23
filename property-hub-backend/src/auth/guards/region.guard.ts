import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_REGION_KEY } from '../../common/decorators/require-region.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class RegionGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isRegionRequired = this.reflector.getAllAndOverride<boolean>(REQUIRE_REGION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!isRegionRequired) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: AuthenticatedUser = request.user;
        const regionSlug = request.params.regionSlug || request.params.region;

        if (!user) {
            return false;
        }

        if (!regionSlug) {
            throw new ForbiddenException('Region context is required but :region or :regionSlug param is missing');
        }

        // Keycloak groups are expected in format: /regions/mumbai-west
        const requiredGroup = `/regions/${regionSlug}`;

        const hasAccess = user.groups.includes(requiredGroup);

        if (!hasAccess) {
            throw new ForbiddenException(`User does not have access to region: ${regionSlug}`);
        }

        return true;
    }
}
