/**
 * Routing utilities for role-based dashboard routing
 * 
 * This module defines the canonical dashboard routes and provides
 * utilities for role-based redirection logic.
 * 
 * ROUTING PRINCIPLE:
 * - Buyers use the shortest route: /dashboard
 * - All other roles use role-based routes: /{role}/dashboard
 * - One role = one dashboard route (no shared dashboards)
 */

export type UserRole =
  | 'BUYER'
  | 'CONSULTANT'
  | 'PROPERTY_PARTNER'
  | 'LOAN_ADVISOR'

  | 'CENTRAL_AUTHORITY'
  | 'MARKETING_MANAGER'
  | 'INFLUENCER';

/**
 * Canary dashboard routes for each role
 * Maps standardized backend roles to their frontend dashboard routes
 */
export const DASHBOARD_ROUTES: Record<string, string> = {
  BUYER: '/dashboard',
  CONSULTANT: '/dashboard',
  PROPERTY_PARTNER: '/dashboard',

  LOAN_ADVISOR: '/dashboard',

  CENTRAL_AUTHORITY: '/dashboard',
  MARKETING_MANAGER: '/dashboard',
  INFLUENCER: '/dashboard',
};

/**
 * Get the canonical dashboard route for a given role
 */
export function getDashboardRoute(role: string): string {
  return DASHBOARD_ROUTES[role] || '/dashboard';
}

/**
 * Get the role from a dashboard route path
 * Returns standardized role name
 */
export function getRoleFromPath(pathname: string): UserRole | null {
  // Since all roles now share /dashboard, we can't reliably infer role from path alone.
  // Role inference should now happen via AuthContext/cookies or explicit requiredRole props.
  // We return null to allow RouteGuard to use its explicit requirements.
  return null;
}

/**
 * Check if a user should be redirected from their current path
 * Returns the target dashboard route if redirection is needed, null otherwise
 */
export function getRedirectTarget(
  currentPath: string,
  userRole: string
): string | null {
  const routeForRole = getDashboardRoute(userRole);
  const roleFromPath = getRoleFromPath(currentPath);

  // If user is on the correct dashboard for their role, no redirect needed
  if (roleFromPath === userRole) {
    return null;
  }

  // If user is on a dashboard route but it's not for their role, redirect
  if (roleFromPath !== null && roleFromPath !== userRole) {
    return routeForRole;
  }

  // If user is on /dashboard but is not a buyer, redirect
  if (currentPath === '/dashboard' && userRole !== 'BUYER') {
    return routeForRole;
  }

  return null;
}

/**
 * All dashboard routes (for reference/validation)
 */
export const ALL_DASHBOARD_ROUTES = Object.values(DASHBOARD_ROUTES);
