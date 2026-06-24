import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';

export const ROLES_KEY = 'roles';
/**
 * Decorator to specify required realm roles for a route
 */
export const RequireRoles = (...roles: (UserRole | string)[]) => SetMetadata(ROLES_KEY, roles);
