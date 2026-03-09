'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

// --- Types ---
export type RoleId =
    | 'central-authority'
    | 'broker'
    | 'marketing-manager'
    | 'onboarding-manager'
    | 'property-partner'
    | 'consultant'
    | 'loan-adviser'
    | 'visit-executive'
    | 'buyer'
    | 'influencer';

export interface UserRole {
    id: RoleId;
    name: string;
    permissionHint: string;
    dashboardUrl: string;
}

export interface CityAllocation {
    id: string;
    cityName: string;
    stateCode: string;
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
    switchContext: (roleId: RoleId) => void;
    isProfileOpen: boolean;
    setIsProfileOpen: (open: boolean) => void;
}

// --- Application Configuration (Static) ---
const KNOWN_ROLES: UserRole[] = [
    {
        id: 'central-authority',
        name: 'Central Authority',
        permissionHint: 'Platform-wide administrator',
        dashboardUrl: '/central-authority/dashboard'
    },
    {
        id: 'marketing-manager',
        name: 'Marketing Manager',
        permissionHint: 'Manage campaigns & leads platform-wide',
        dashboardUrl: '/marketing-manager/dashboard'
    },
    {
        id: 'onboarding-manager',
        name: 'Onboarding Manager',
        permissionHint: 'Property intake and verification',
        dashboardUrl: '/onboarding-manager/dashboard'
    },
    {
        id: 'property-partner',
        name: 'Property Partner',
        permissionHint: 'Manage properties and inventory',
        dashboardUrl: '/property-partner/dashboard'
    },
    {
        id: 'broker',
        name: 'Real Estate Broker',
        permissionHint: 'Referral, lead management and property creation',
        dashboardUrl: '/broker/dashboard'
    },
    {
        id: 'consultant',
        name: 'Sales Consultant',
        permissionHint: 'Direct sales and client guidance',
        dashboardUrl: '/consultant/dashboard'
    },
    {
        id: 'loan-adviser',
        name: 'Loan Adviser',
        permissionHint: 'Financial and loan facilitation',
        dashboardUrl: '/loan-adviser/dashboard'
    },
    {
        id: 'visit-executive',
        name: 'Visit Executive',
        permissionHint: 'Property site visits and viewings',
        dashboardUrl: '/visit-executive/dashboard'
    },
    {
        id: 'buyer',
        name: 'Buyer',
        permissionHint: 'Property search and purchase',
        dashboardUrl: '/dashboard'
    }
];

const DEFAULT_CONTEXT: UnifiedAppContextType = {
    currentUser: {
        name: 'Guest',
        avatar: 'https://ui-avatars.com/api/?name=Guest&background=0D8ABC&color=fff',
        availableRoles: []
    },
    activeContext: {
        activeRole: KNOWN_ROLES[KNOWN_ROLES.length - 1], // Default to buyer
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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
                roleList = [KNOWN_ROLES[KNOWN_ROLES.length - 1]];
            }

            if (roleList.length > 0) {
                setAvailableRoles(roleList);

                // 2. Determine Active Role intelligently
                // - Highest Priority: The actual URL path we are on (prevents mismatch)
                // - Second Priority: The locally stored selection for this device
                // - Third Priority: The user's global default role
                // - Fallback: First available role

                let pathMatchedRole: UserRole | undefined;

                // Check if current URL matches a specific role dashboard pattern
                for (const r of roleList) {
                    if (pathname && pathname.startsWith(`/${r.id}`)) {
                        pathMatchedRole = r;
                        break;
                    }
                }

                const savedRoleId = localStorage.getItem('activeRoleId') as RoleId | null;
                const defaultRoleId = user?.defaultRole as RoleId | undefined;

                const resolvedRole =
                    pathMatchedRole ||
                    (savedRoleId && roleList.find(r => r.id === savedRoleId)) ||
                    (defaultRoleId && roleList.find(r => r.id === defaultRoleId)) ||
                    roleList[0];

                setActiveRole(resolvedRole);

                // Sync to localStorage so it persists across reloads on non-dashboard pages
                if (resolvedRole) {
                    localStorage.setItem('activeRoleId', resolvedRole.id);
                }
            }

        };
        syncAppData();
    }, [initialized, authenticated, user, roles, activeRole?.id, pathname]);

    const switchContext = (roleId: RoleId) => {
        const role = availableRoles.find(r => r.id === roleId);
        if (!role) return;

        setActiveRole(role);
        localStorage.setItem('activeRoleId', roleId);

        console.log(`Switching context to role: ${role.name}`);
        router.push(role.dashboardUrl);
    };



    const displayName = user ? (user.name || `${user.given_name || ''} ${user.family_name || ''}`.trim() || user.preferred_username || 'User') : 'Guest';
    const avatarUrl = user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff` : DEFAULT_CONTEXT.currentUser.avatar;

    const fallbackRole = KNOWN_ROLES[KNOWN_ROLES.length - 1]; // buyer as last-resort default

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
