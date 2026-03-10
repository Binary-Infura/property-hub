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
  | 'BROKER'
  | 'LOAN_ADVISOR'
  | 'VISIT_EXECUTIVE'
  | 'ONBOARDING_MANAGER'
  | 'CENTRAL_AUTHORITY'
  | 'MARKETING_MANAGER'
  | 'INFLUENCER';

/**
 * Canary dashboard routes for each role
 * Maps standardized backend roles to their frontend dashboard routes
 */
export const DASHBOARD_ROUTES: Record<string, string> = {
  BUYER: '/dashboard',
  CONSULTANT: '/consultant/dashboard',
  PROPERTY_PARTNER: '/property-partner/dashboard',
  BROKER: '/broker/dashboard',
  LOAN_ADVISOR: '/loan-adviser/dashboard',
  VISIT_EXECUTIVE: '/visit-executive/dashboard',
  ONBOARDING_MANAGER: '/onboarding-manager/dashboard',
  CENTRAL_AUTHORITY: '/central-authority/dashboard',
  MARKETING_MANAGER: '/marketing-manager/dashboard',
  INFLUENCER: '/influencer/dashboard',
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
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return 'BUYER';
  }
  if (pathname.startsWith('/consultant/dashboard')) {
    return 'CONSULTANT';
  }
  if (pathname.startsWith('/property-partner/dashboard')) {
    return 'PROPERTY_PARTNER';
  }
  if (pathname.startsWith('/broker/dashboard')) {
    return 'BROKER';
  }
  if (pathname.startsWith('/loan-adviser/dashboard')) {
    return 'LOAN_ADVISOR';
  }
  if (pathname.startsWith('/visit-executive/dashboard')) {
    return 'VISIT_EXECUTIVE';
  }
  if (pathname.startsWith('/onboarding-manager/dashboard')) {
    return 'ONBOARDING_MANAGER';
  }
  if (pathname.startsWith('/central-authority/dashboard')) {
    return 'CENTRAL_AUTHORITY';
  }
  if (pathname.startsWith('/marketing-manager/dashboard')) {
    return 'MARKETING_MANAGER';
  }
  if (pathname.startsWith('/influencer/dashboard')) {
    return 'INFLUENCER';
  }

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
