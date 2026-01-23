import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

/**
 * Guard to check realm-level roles (buyer or internal)
 * For region-specific roles, use RegionRoleGuard instead
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true; // No roles required, allow access
        }

        const request = context.switchToHttp().getRequest();
        const user: AuthenticatedUser = request.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Central authority bypasses role checks
        if (user.isCentralAuthority) {
            return true;
        }

        // Check if user has any of the required roles
        // Note: realmRole is now a single value ('buyer' | 'internal')
        const hasRole = requiredRoles.includes(user.realmRole);

        if (!hasRole) {
            throw new ForbiddenException(
                `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}. You have: ${user.realmRole}`,
            );
        }

        return true;
    }
}
