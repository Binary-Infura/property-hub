'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

// --- Types ---
export type RoleId =
    | 'central-authority'
    | 'dsa'
    | 'marketing-manager'
    | 'commission-manager'
    | 'onboarding-manager'
    | 'property-partner'
    | 'consultant'
    | 'loan-adviser'
    | 'visit-executive'
    | 'service-provider'
    | 'buyer';

export interface UserRole {
    id: RoleId;
    name: string;
    permissionHint: string;
    dashboardUrl: string;
}

export interface Region {
    id: string;
    name: string;
    code: string;
    city?: string;
    state?: string;
}

export interface UserContextData {
    activeRegion: Region;
    activeRole: UserRole;
}

export interface UnifiedAppContextType {
    currentUser: {
        name: string;
        avatar: string;
        availableRegions: Region[];
        availableRoles: UserRole[];
    };
    activeContext: UserContextData;
    switchContext: (regionId: string, roleId: RoleId) => void;
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
        permissionHint: 'Manage campaigns & leads for region',
        dashboardUrl: '/marketing-manager/dashboard'
    },
    {
        id: 'commission-manager',
        name: 'Commission Manager',
        permissionHint: 'Oversee regional commissions',
        dashboardUrl: '/commission-manager/dashboard'
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
        id: 'dsa',
        name: 'DSA (Direct Selling Agent)',
        permissionHint: 'Referral, lead management and property creation',
        dashboardUrl: '/dsa/dashboard'
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
        id: 'service-provider',
        name: 'Service Provider',
        permissionHint: 'Maintenance and vendor operations',
        dashboardUrl: '/service-provider/dashboard'
    },
    {
        id: 'buyer',
        name: 'Buyer',
        permissionHint: 'Property search and purchase',
        dashboardUrl: '/dashboard'
    }
];

const GLOBAL_REGION: Region = { id: 'global', name: 'Global', code: 'global' };

const DEFAULT_CONTEXT: UnifiedAppContextType = {
    currentUser: {
        name: 'Guest',
        avatar: 'https://ui-avatars.com/api/?name=Guest&background=0D8ABC&color=fff',
        availableRegions: [GLOBAL_REGION],
        availableRoles: []
    },
    activeContext: {
        activeRegion: GLOBAL_REGION,
        activeRole: KNOWN_ROLES[KNOWN_ROLES.length - 1] // Default to buyer
    },
    switchContext: () => { }
};

// --- Context ---
const UnifiedAppContext = createContext<UnifiedAppContextType>(DEFAULT_CONTEXT);

// --- Provider ---
export function UnifiedAppProvider({ children }: { children: ReactNode }) {
    const { user, roles, authenticated, initialized, token } = useAuth();
    const router = useRouter();

    const [activeRegion, setActiveRegion] = useState<Region>(GLOBAL_REGION);
    const [activeRole, setActiveRole] = useState<UserRole>(KNOWN_ROLES[KNOWN_ROLES.length - 1]);
    const [availableRegions, setAvailableRegions] = useState<Region[]>([GLOBAL_REGION]);
    const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);

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
            }

            // 2. Determine Regions - Simplified to Global
            setAvailableRegions([GLOBAL_REGION]);
            setActiveRegion(GLOBAL_REGION);

            // 3. Set Active Context Defaults
            // Select Role
            const savedRoleId = localStorage.getItem('activeRoleId');
            const recoveredRole = roleList.find(r => r.id === savedRoleId);
            if (recoveredRole) {
                setActiveRole(recoveredRole);
            } else if (roleList.length > 0) {
                setActiveRole(roleList[0]);
            }
        };

        syncAppData();
    }, [initialized, authenticated, user, roles, token]);

    const switchContext = (regionId: string, roleId: RoleId) => {
        // regionId is now ignored, we always stay in GLOBAL_REGION
        const role = availableRoles.find(r => r.id === roleId);
        if (!role) return;

        setActiveRole(role);
        localStorage.setItem('activeRoleId', roleId);

        console.log(`Switching context to role: ${role.name}`);
        router.push(role.dashboardUrl);
    };

    const displayName = user ? (user.name || `${user.given_name || ''} ${user.family_name || ''}`.trim() || user.preferred_username || 'User') : 'Guest';
    const avatarUrl = user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff` : DEFAULT_CONTEXT.currentUser.avatar;

    const value = {
        currentUser: {
            name: displayName,
            avatar: avatarUrl,
            availableRegions,
            availableRoles
        },
        activeContext: {
            activeRegion,
            activeRole
        },
        switchContext
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
