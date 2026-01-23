import { SetMetadata } from '@nestjs/common';

export const REQUIRE_REGION_KEY = 'require_region';
/**
 * Decorator to enforce region-based access control
 */
export const RequireRegion = () => SetMetadata(REQUIRE_REGION_KEY, true);
