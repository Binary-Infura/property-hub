'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

// --- Types ---
export type RoleId =
    | 'CENTRAL_AUTHORITY'
    | 'BROKER'
    | 'MARKETING_MANAGER'
    | 'ONBOARDING_MANAGER'
    | 'PROPERTY_PARTNER'
    | 'CONSULTANT'
    | 'LOAN_ADVISOR'
    | 'VISIT_EXECUTIVE'
    | 'BUYER'
    | 'INFLUENCER';

export interface UserRole {
    id: RoleId;
    name: string;
    permissionHint: string;
    dashboardUrl: string;
}

export interface CityAllocation {
    id: string;
    cityName: string;
    assignedAt: string;
}

export interface UserContextData {
    activeRole: UserRole;
    activeCity: CityAllocation | null;
}

export interface UnifiedAppContextType {
    currentUser: {
        name: string;
        avatar: string;
        availableRoles: UserRole[];
    };
    activeContext: UserContextData;
    switchContext: (roleId: RoleId, shouldRedirect?: boolean) => void;
    isProfileOpen: boolean;
    setIsProfileOpen: (open: boolean) => void;
}

// --- Application Configuration (Static) ---
const KNOWN_ROLES: UserRole[] = [
    {
        id: 'CENTRAL_AUTHORITY',
        name: 'Central Authority',
        permissionHint: 'Platform-wide administrator',
        dashboardUrl: '/central-authority/dashboard'
    },
    {
        id: 'MARKETING_MANAGER',
        name: 'Marketing Manager',
        permissionHint: 'Manage campaigns & leads platform-wide',
        dashboardUrl: '/marketing-manager/dashboard'
    },
    {
        id: 'ONBOARDING_MANAGER',
        name: 'Onboarding Manager',
        permissionHint: 'Property intake and verification',
        dashboardUrl: '/onboarding-manager/dashboard'
    },
    {
        id: 'PROPERTY_PARTNER',
        name: 'Property Partner',
        permissionHint: 'Manage properties and inventory',
        dashboardUrl: '/property-partner/dashboard'
    },
    {
        id: 'BROKER',
        name: 'Real Estate Broker',
        permissionHint: 'Referral, lead management and property creation',
        dashboardUrl: '/broker/dashboard'
    },
    {
        id: 'CONSULTANT',
        name: 'Sales Consultant',
        permissionHint: 'Direct sales and client guidance',
        dashboardUrl: '/consultant/dashboard'
    },
    {
        id: 'LOAN_ADVISOR',
        name: 'Loan Advisor',
        permissionHint: 'Financial and loan facilitation',
        dashboardUrl: '/loan-adviser/dashboard'
    },
    {
        id: 'VISIT_EXECUTIVE',
        name: 'Visit Executive',
        permissionHint: 'Property site visits and viewings',
        dashboardUrl: '/visit-executive/dashboard'
    },
    {
        id: 'BUYER',
        name: 'Buyer',
        permissionHint: 'Property search and purchase',
        dashboardUrl: '/dashboard'
    },
    {
        id: 'INFLUENCER',
        name: 'Influencer',
        permissionHint: 'Marketing influencer',
        dashboardUrl: '/influencer/dashboard'
    }
];

const DEFAULT_CONTEXT: UnifiedAppContextType = {
    currentUser: {
        name: 'Guest',
        avatar: 'https://ui-avatars.com/api/?name=Guest&background=0D8ABC&color=fff',
        availableRoles: []
    },
    activeContext: {
        activeRole: KNOWN_ROLES[8], // Default to buyer
        activeCity: null
    },
    switchContext: () => { },
    isProfileOpen: false,
    setIsProfileOpen: () => { }
};

// --- Context ---
const UnifiedAppContext = createContext<UnifiedAppContextType>(DEFAULT_CONTEXT);

// --- Provider ---
export function UnifiedAppProvider({ children }: { children: ReactNode }) {
    const { user, roles, authenticated, initialized, token } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [activeRole, setActiveRole] = useState<UserRole | null>(null);
    const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Sync context with Auth state
    useEffect(() => {
        if (!initialized) return;

        const syncAppData = async () => {
            let roleList: UserRole[] = [];

            // 1. Determine Roles
            if (authenticated && user) {
                roleList = KNOWN_ROLES.filter(knownRole =>
                    roles.includes(knownRole.id)
                );
            } else {
                // Guests are treated as buyers for discovery purposes
                roleList = [KNOWN_ROLES.find(r => r.id === 'BUYER')!];
            }

            if (roleList.length > 0) {
                setAvailableRoles(roleList);

                // 2. Determine Active Role intelligently
                let pathMatchedRole: UserRole | undefined;

                // Check if current URL matches a specific role dashboard pattern
                for (const r of roleList) {
                    // Check both standardized role path and buyer dashboard
                    if (pathname && (
                        pathname.startsWith(r.dashboardUrl) ||
                        (r.id === 'BUYER' && (pathname === '/dashboard' || pathname.startsWith('/dashboard/')))
                    )) {
                        pathMatchedRole = r;
                        break;
                    }
                }

                const savedRoleId = localStorage.getItem('activeRoleId') as RoleId | null;
                const primaryRoleId = user?.primaryRole as RoleId | undefined;

                const resolvedRole =
                    pathMatchedRole ||
                    (savedRoleId && roleList.find(r => r.id === savedRoleId)) ||
                    (primaryRoleId && roleList.find(r => r.id === primaryRoleId)) ||
                    roleList[0];

                setActiveRole(resolvedRole);

                if (resolvedRole) {
                    localStorage.setItem('activeRoleId', resolvedRole.id);
                }
            }

        };
        syncAppData();
    }, [initialized, authenticated, user, roles, activeRole?.id, pathname]);

    const switchContext = (roleId: RoleId, shouldRedirect: boolean = true) => {
        const role = availableRoles.find(r => r.id === roleId);
        if (!role) return;

        setActiveRole(role);
        localStorage.setItem('activeRoleId', roleId);

        console.log(`Switching context to role: ${role.name}`);
        if (shouldRedirect) {
            router.push(role.dashboardUrl);
        }
    };

    const displayName = user ? (user.firstName || user.name || 'User') : 'Guest';
    const avatarUrl = user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff` : DEFAULT_CONTEXT.currentUser.avatar;

    const fallbackRole = KNOWN_ROLES.find(r => r.id === 'BUYER')!;

    const value = {
        currentUser: {
            name: displayName,
            avatar: avatarUrl,
            availableRoles
        },
        activeContext: {
            activeRole: activeRole ?? fallbackRole,
            activeCity: null
        },
        switchContext,
        isProfileOpen,
        setIsProfileOpen
    };

    return (
        <UnifiedAppContext.Provider value={value}>
            {children}
        </UnifiedAppContext.Provider>
    );
}

// --- Hook ---
export function useUnifiedApp() {
    return useContext(UnifiedAppContext);
}
