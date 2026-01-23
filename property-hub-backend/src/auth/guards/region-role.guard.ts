import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REGION_ROLES_KEY } from '../../common/decorators/region-roles.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

/**
 * Guard to check if user has required roles within a specific region
 * Region is extracted from route parameters (e.g., /api/:region/properties)
 * Central authority users bypass all region-role checks
 */
@Injectable()
export class RegionRoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(REGION_ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true; // No specific roles required, allow access
        }

        const request = context.switchToHttp().getRequest();
        const user: AuthenticatedUser = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Central authority bypasses all region-role checks
        if (user.isCentralAuthority) {
            return true;
        }

        // Extract region from route params
        const region = request.params.region;
        if (!region) {
            throw new BadRequestException('Region parameter is required for this endpoint');
        }

        // Check if user has access to this region
        const userRegionRoles = user.regionRoles[region];
        if (!userRegionRoles) {
            throw new ForbiddenException(
                `No access to region: ${region}. You do not have permissions for this region.`,
            );
        }

        // Check if user has any of the required roles in this region
        const hasRole = requiredRoles.some(role =>
            userRegionRoles.roles.includes(role)
        );

        if (!hasRole) {
            throw new ForbiddenException(
                `Insufficient permissions in region ${region}. Required roles: ${requiredRoles.join(', ')}`,
            );
        }

        return true;
    }
}
