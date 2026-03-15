'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { UserRole } from '@/app/lib/routing';

interface RouteGuardProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
}

/**
 * Protects routes based on authentication and active role.
 * Redirects to /signin if unauthenticated.
 * Redirects to /dashboard if the user's activeRole doesn't match the page's requiredRole.
 */
export default function RouteGuard({ children, requiredRole }: RouteGuardProps) {
    const { authenticated, activeRole, initialized } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!initialized) return;

        if (!authenticated) {
            router.push('/signin');
            return;
        }

        // If this page requires a specific role, the user's JWT activeRole MUST match exactly.
        if (requiredRole && activeRole !== requiredRole) {
            console.warn(`RouteGuard: activeRole="${activeRole}" ≠ requiredRole="${requiredRole}". Redirecting to /dashboard.`);
            router.push('/dashboard');
        }
    }, [authenticated, activeRole, initialized, router, pathname, requiredRole]);

    // Show spinner while initialising or not yet authenticated
    if (!initialized || (!authenticated && pathname !== '/')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Verifying access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
