import { SetMetadata } from '@nestjs/common';

export const REGION_ROLES_KEY = 'region_roles';

/**
 * Decorator to specify required roles within a region for an endpoint
 * Works with RegionRoleGuard to check user's roles in the route's region parameter
 * 
 * Example:
 * @RequireRegionRole('regional-manager', 'marketing-lead')
 * 
 * @param roles - Array of role names (e.g., ['regional-manager', 'marketing-lead'])
 */
export const RequireRegionRole = (...roles: string[]) => SetMetadata(REGION_ROLES_KEY, roles);
