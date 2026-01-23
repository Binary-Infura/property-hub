import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/**
 * Decorator to specify required realm roles for a route
 */
export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
