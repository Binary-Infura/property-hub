'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

// --- Types ---
export type RoleId =
    | 'central-authority'
    | 'regional-manager'
    | 'marketing-manager'

    | 'commission-manager'
    | 'onboarding-manager'
    | 'property-partner'
    | 'channel-partner'
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
        id: 'regional-manager',
        name: 'Regional Manager',
        permissionHint: 'Full access to selected region',
        dashboardUrl: '/regional-manager/dashboard'
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
        id: 'channel-partner',
        name: 'Channel Partner',
        permissionHint: 'Referral and lead management',
        dashboardUrl: '/channel-partner/dashboard'
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

const NO_REGION: Region = { id: 'no-region', name: 'No Region Allocated', code: 'no-region' };

const DEFAULT_CONTEXT: UnifiedAppContextType = {
    currentUser: {
        name: 'Guest',
        avatar: 'https://ui-avatars.com/api/?name=Guest&background=0D8ABC&color=fff',
        availableRegions: [NO_REGION],
        availableRoles: []
    },
    activeContext: {
        activeRegion: NO_REGION,
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

    const [activeRegion, setActiveRegion] = useState<Region>(NO_REGION);
    const [activeRole, setActiveRole] = useState<UserRole>(KNOWN_ROLES[KNOWN_ROLES.length - 1]);
    const [availableRegions, setAvailableRegions] = useState<Region[]>([NO_REGION]);
    const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Sync context with Auth state
    useEffect(() => {
        if (!initialized || !authenticated || !user) return;

        // 1. Map roles from AuthContext to UserRole objects
        const userRoles = KNOWN_ROLES.filter(knownRole =>
            roles.includes(knownRole.id)
        );
        if (userRoles.length > 0) {
            setAvailableRoles(userRoles);
        }

        // 2. Map regions
        const isGlobal = roles.includes('central-authority') || roles.includes('property-partner');
        const isCentralAuthority = roles.includes('central-authority');

        const updateRegions = async () => {
            let allRegions: Region[] = [];
            let userRegions: Region[] = [];

            // 1. Fetch all operational regions from Global API (Required for all users to resolve names/codes)
            try {
                const response = await fetch(`${API_URL}/api/regions?limit=1000`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const result = await response.json();
                    allRegions = result.data.map((r: any) => ({
                        id: r.id,
                        name: r.name,
                        code: r.code,
                        city: r.city,
                        state: r.state
                    }));
                }
            } catch (e) {
                console.error("Failed to fetch regions from API:", e);
            }

            if (isGlobal) {
                userRegions = allRegions;
            } else {
                try {
                    // 2. Filter available regions based on Keycloak groups
                    const groups = (user.groups || []) as string[];

                    const userRegionCodes = groups
                        .filter(g => g.startsWith('/regions/'))
                        .map(g => g.replace('/regions/', ''));

                    const userCitySlugs = groups
                        .filter(g => g.startsWith('/cities/'))
                        .map(g => g.replace('/cities/', ''));

                    userRegions = allRegions.filter(region => {
                        // Check if direct region match
                        if (userRegionCodes.includes(region.code)) return true;

                        // Check if city match (converting city name to slug like backend does)
                        if (region.city) {
                            const citySlug = region.city.toLowerCase().replace(/\s+/g, '-');
                            if (userCitySlugs.includes(citySlug)) return true;
                        }

                        return false;
                    });
                } catch (e) {
                    console.error("Failed to solve regions from user groups:", e);
                }
            }

            if (userRegions.length === 0) {
                userRegions = [NO_REGION];
            }

            setAvailableRegions(userRegions);

            // 3. Set Active Context Defaults
            // Set role
            if (userRoles.length > 0 && !userRoles.find(r => r.id === activeRole.id)) {
                setActiveRole(userRoles[0]);
            }

            // Set region
            if (userRegions.length > 0 && !userRegions.find(r => r.id === activeRegion.id)) {
                setActiveRegion(userRegions[0]);
            }
        };

        updateRegions();

    }, [initialized, authenticated, user, roles, token]);

    const switchContext = (regionId: string, roleId: RoleId) => {
        const region = availableRegions.find(r => r.id === regionId);
        if (!region) return;

        const role = availableRoles.find(r => r.id === roleId);
        if (!role) return;

        setActiveRegion(region);
        setActiveRole(role);

        console.log(`Switching context to: ${region.name} - ${role.name}`);
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
