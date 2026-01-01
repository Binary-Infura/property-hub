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

export type UserRole = 'buyer' | 'consultant' | 'builder' | 'admin' | 'loan-adviser' | 'leads-manager';

/**
 * Canonical dashboard routes for each role
 */
export const DASHBOARD_ROUTES = {
  buyer: '/dashboard',
  consultant: '/consultant/dashboard',
  builder: '/builder/dashboard',
  admin: '/admin/dashboard',
  'loan-adviser': '/loan-adviser/dashboard',
  'leads-manager': '/leads-manager/dashboard',
} as const;

/**
 * Get the canonical dashboard route for a given role
 */
export function getDashboardRoute(role: UserRole): string {
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
  if (pathname.startsWith('/builder/dashboard')) {
    return 'builder';
  }
  if (pathname.startsWith('/admin/dashboard')) {
    return 'admin';
  }
  if (pathname.startsWith('/loan-adviser/dashboard')) {
    return 'loan-adviser';
  }
  if (pathname.startsWith('/leads-manager/dashboard')) {
    return 'leads-manager';
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
