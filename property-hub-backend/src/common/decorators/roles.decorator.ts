import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required realm-level roles for an endpoint
 * Use this for checking buyer vs internal access
 * For region-specific roles, use @RequireRegionRole instead
 * 
 * @param roles - Array of realm role names: 'buyer' or 'internal'
 * 
 * Example:
 * @Roles('internal')  // Only internal users can access
 * @Roles('buyer')     // Only buyers can access
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
