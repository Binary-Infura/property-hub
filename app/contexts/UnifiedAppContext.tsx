'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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
    const router = useRouter();
    const [activeRegion, setActiveRegion] = useState<Region>(MOCK_REGIONS[0]);
    const [activeRole, setActiveRole] = useState<UserRole>(MOCK_ROLES[0]);

    const switchContext = (regionId: string, roleId: RoleId) => {
        const region = MOCK_REGIONS.find(r => r.id === regionId);
        if (!region) return;

        const role = MOCK_ROLES.find(r => r.id === roleId);
        if (!role) return;

        setActiveRegion(region);
        setActiveRole(role);

        // Perform navigation if the dashboard URL is different from current or just to refresh
        // In a real app, we might check pathname to avoid unnecessary replace
        console.log(`Switching context to: ${region.name} - ${role.name}`);
        router.push(role.dashboardUrl);
    };

    const value = {
        currentUser: DEFAULT_CONTEXT.currentUser,
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
