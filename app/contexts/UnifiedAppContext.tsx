'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

// --- Types ---
export type RoleId = 'regional-manager' | 'marketing-manager' | 'central-authority' | 'property-partner' | 'buyer';

export interface UserRole {
    id: RoleId;
    name: string;
    permissionHint: string;
    dashboardUrl: string;
}

export interface Region {
    id: string;
    name: string;
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

// --- Mock Data ---
const MOCK_REGIONS: Region[] = [
    { id: 'r_mumbai_west', name: 'West Mumbai' },
    { id: 'r_mumbai_south', name: 'South Mumbai' },
    { id: 'r_pune_west', name: 'Pune West' }
];

const MOCK_ROLES: UserRole[] = [
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
        id: 'property-partner',
        name: 'Property Partner',
        permissionHint: 'Manage properties and inventory',
        dashboardUrl: '/property-partner/dashboard'
    }
];

const DEFAULT_CONTEXT: UnifiedAppContextType = {
    currentUser: {
        name: 'Parth Singh',
        avatar: 'https://ui-avatars.com/api/?name=Parth+Singh&background=0D8ABC&color=fff',
        availableRegions: MOCK_REGIONS,
        availableRoles: MOCK_ROLES
    },
    activeContext: {
        activeRegion: MOCK_REGIONS[0],
        activeRole: MOCK_ROLES[0]
    },
    switchContext: () => { }
};

// --- Context ---
const UnifiedAppContext = createContext<UnifiedAppContextType>(DEFAULT_CONTEXT);

// --- Provider ---
export function UnifiedAppProvider({ children }: { children: ReactNode }) {
    const { user, roles, authenticated, initialized } = useAuth();
    const router = useRouter();

    const [activeRegion, setActiveRegion] = useState<Region>(MOCK_REGIONS[0]);
    const [activeRole, setActiveRole] = useState<UserRole>(MOCK_ROLES[0]);
    const [availableRegions, setAvailableRegions] = useState<Region[]>(MOCK_REGIONS);
    const [availableRoles, setAvailableRoles] = useState<UserRole[]>(MOCK_ROLES);

    // Sync context with Auth state
    useEffect(() => {
        if (!initialized || !authenticated || !user) return;

        // 1. Map roles from AuthContext to UserRole objects
        const userRoles = MOCK_ROLES.filter(mockRole =>
            roles.includes(mockRole.id as string)
        );
        if (userRoles.length > 0) {
            setAvailableRoles(userRoles);
        }

        // 2. Map regions from user attributes
        let userRegions: Region[] = [];
        const isCentralAuthority = roles.includes('central-authority');

        if (isCentralAuthority) {
            userRegions = MOCK_REGIONS;
        } else {
            try {
                // Keycloak attributes come as string arrays in idTokenParsed
                const regionsAttr = user.regions;
                if (regionsAttr) {
                    const rawData = Array.isArray(regionsAttr) ? regionsAttr[0] : regionsAttr;
                    const regionsData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

                    if (typeof regionsData === 'object' && regionsData !== null) {
                        userRegions = Object.keys(regionsData).map(id => {
                            const mock = MOCK_REGIONS.find(r => r.id === id);
                            return mock || {
                                id,
                                name: id.replace('r_', '').split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                            };
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to parse regions from user token:", e);
            }
        }

        // Handle case where user has no regions
        if (userRegions.length === 0) {
            userRegions = [{ id: 'no-region', name: 'No Region Allocated' }];
        }
        setAvailableRegions(userRegions);

        // 3. Set Active Context Defaults
        // If current active role is not in the user's available roles, switch to the first available
        if (userRoles.length > 0 && !userRoles.find(r => r.id === activeRole.id)) {
            setActiveRole(userRoles[0]);
        }

        // If current active region is not in available regions, switch to the first available
        if (userRegions.length > 0 && !userRegions.find(r => r.id === activeRegion.id)) {
            setActiveRegion(userRegions[0]);
        }
    }, [initialized, authenticated, user, roles]);

    const switchContext = (regionId: string, roleId: RoleId) => {
        // Look up in all known regions/roles to allow switching
        const region = [...MOCK_REGIONS, { id: 'no-region', name: 'No Region Allocated' }].find(r => r.id === regionId);
        if (!region) return;

        const role = MOCK_ROLES.find(r => r.id === roleId);
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
