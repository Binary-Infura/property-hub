'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getRoleFromPath, UserRole } from '@/app/lib/routing';

interface RouteGuardProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
}

/**
 * A wrapper component that protects routes based on authentication and roles.
 * Redirects to /signin if not authenticated.
 * Redirects to home if authenticated but lacks the required role.
 */
export default function RouteGuard({ children, requiredRole }: RouteGuardProps) {
    const { authenticated, roles, initialized } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!initialized) return;

        // 1. Not Authenticated: Redirect to Sign In
        if (!authenticated) {
            console.log(`RouteGuard: Not authenticated, redirecting from ${pathname} to /signin`);
            router.push('/signin');
            return;
        }

        // 2. Authenticated but checking specific role requirements
        // If a requiredRole is passed explicitly, use that.
        // Otherwise, try to infer the required role from the current path.
        const effectiveRequiredRole = requiredRole || getRoleFromPath(pathname);

        if (effectiveRequiredRole && !roles.includes(effectiveRequiredRole)) {
            console.warn(`RouteGuard: User does not have required role "${effectiveRequiredRole}". User roles:`, roles);
            // Redirect to home if they are in the wrong place
            router.push('/');
        }
    }, [authenticated, roles, initialized, router, pathname, requiredRole]);

    // While initializing or if unauthenticated, show nothing or a loader
    if (!initialized || (!authenticated && pathname !== '/')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Verifying access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
