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

export type UserRole = 'buyer' | 'consultant' | 'property-partner' | 'regional-manager' | 'loan-adviser' | 'commission-manager' | 'channel-partner' | 'visit-executive' | 'onboarding-manager' | 'central-authority' | 'marketing-manager';

/**
 * Canonical dashboard routes for each role
 */
export const DASHBOARD_ROUTES = {
  buyer: '/dashboard',
  consultant: '/consultant/dashboard',
  'property-partner': '/property-partner/dashboard',
  'regional-manager': '/regional-manager/dashboard',
  'loan-adviser': '/loan-adviser/dashboard',
  'commission-manager': '/commission-manager/dashboard',
  'channel-partner': '/channel-partner/dashboard',
  'visit-executive': '/visit-executive/dashboard',
  'onboarding-manager': '/onboarding-manager/dashboard',
  'central-authority': '/central-authority/dashboard',
  'marketing-manager': '/marketing-manager/dashboard',
} as const;

/**
 * Get the canonical dashboard route for a given role
 */
export function getDashboardRoute(role: UserRole): string {
  // @ts-ignore
  return DASHBOARD_ROUTES[role];
}

/**
 * Get the role from a dashboard route path
 * Returns null if the path is not a dashboard route
 */
export function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return 'buyer';
  }
  if (pathname.startsWith('/consultant/dashboard')) {
    return 'consultant';
  }
  if (pathname.startsWith('/property-partner/dashboard')) {
    return 'property-partner';
  }
  if (pathname.startsWith('/regional-manager/dashboard')) {
    return 'regional-manager';
  }
  if (pathname.startsWith('/loan-adviser/dashboard')) {
    return 'loan-adviser';
  }

  if (pathname.startsWith('/commission-manager/dashboard')) {
    return 'commission-manager';
  }
  if (pathname.startsWith('/channel-partner/dashboard')) {
    return 'channel-partner';
  }
  if (pathname.startsWith('/visit-executive/dashboard')) {
    return 'visit-executive';
  }
  if (pathname.startsWith('/onboarding-manager/dashboard')) {
    return 'onboarding-manager';
  }

  return null;
}

/**
 * Check if a user should be redirected from their current path
 * Returns the target dashboard route if redirection is needed, null otherwise
 */
export function getRedirectTarget(
  currentPath: string,
  userRole: UserRole
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
  if (currentPath === '/dashboard' && userRole !== 'buyer') {
    return routeForRole;
  }

  return null;
}

/**
 * All dashboard routes (for reference/validation)
 */
export const ALL_DASHBOARD_ROUTES = Object.values(DASHBOARD_ROUTES);
