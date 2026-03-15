'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type RoleId =
    | 'CENTRAL_AUTHORITY'
    | 'MARKETING_MANAGER'
    | 'PROPERTY_PARTNER'
    | 'CONSULTANT'
    | 'LOAN_ADVISOR'
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
    isProfileOpen: boolean;
    setIsProfileOpen: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Static role catalogue — add / remove roles HERE only
// ---------------------------------------------------------------------------
export const KNOWN_ROLES: Record<RoleId, UserRole> = {
    CENTRAL_AUTHORITY: {
        id: 'CENTRAL_AUTHORITY',
        name: 'Central Authority',
        permissionHint: 'Platform-wide administrator',
        dashboardUrl: '/dashboard',
    },
    MARKETING_MANAGER: {
        id: 'MARKETING_MANAGER',
        name: 'Marketing Manager',
        permissionHint: 'Manage campaigns & leads platform-wide',
        dashboardUrl: '/dashboard',
    },
    PROPERTY_PARTNER: {
        id: 'PROPERTY_PARTNER',
        name: 'Property Partner',
        permissionHint: 'Manage properties and inventory',
        dashboardUrl: '/dashboard',
    },
    CONSULTANT: {
        id: 'CONSULTANT',
        name: 'Sales Consultant',
        permissionHint: 'Direct sales and client guidance',
        dashboardUrl: '/dashboard',
    },
    LOAN_ADVISOR: {
        id: 'LOAN_ADVISOR',
        name: 'Loan Advisor',
        permissionHint: 'Financial and loan facilitation',
        dashboardUrl: '/dashboard',
    },
    BUYER: {
        id: 'BUYER',
        name: 'Buyer',
        permissionHint: 'Property search and purchase',
        dashboardUrl: '/dashboard',
    },
    INFLUENCER: {
        id: 'INFLUENCER',
        name: 'Influencer',
        permissionHint: 'Marketing influencer',
        dashboardUrl: '/dashboard',
    },
};

const FALLBACK_ROLE: UserRole = KNOWN_ROLES['BUYER'];

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const UnifiedAppContext = createContext<UnifiedAppContextType>({
    currentUser: { name: 'Guest', avatar: '', availableRoles: [] },
    activeContext: { activeRole: FALLBACK_ROLE, activeCity: null },
    isProfileOpen: false,
    setIsProfileOpen: () => {},
});

// ---------------------------------------------------------------------------
// Provider — all role state is DERIVED from AuthContext, nothing stored locally
// ---------------------------------------------------------------------------
export function UnifiedAppProvider({ children }: { children: ReactNode }) {
    const { user, roles, activeRole: activeRoleId, authenticated } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const displayName = user
        ? `${user.firstName || user.given_name || ''}${user.lastName || user.family_name ? ' ' + (user.lastName || user.family_name) : ''}`.trim() || user.email || 'User'
        : 'Guest';

    const avatarUrl = user
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`
        : '';

    // Compute available roles from the JWT roles array
    const availableRoles = useMemo((): UserRole[] => {
        if (!authenticated || !roles.length) return [FALLBACK_ROLE];
        return roles
            .filter((r): r is RoleId => r in KNOWN_ROLES)
            .map(r => KNOWN_ROLES[r]);
    }, [authenticated, roles]);

    // Resolve the active role from the JWT activeRole — no localStorage, no guessing
    const resolvedActiveRole = useMemo((): UserRole => {
        if (activeRoleId && activeRoleId in KNOWN_ROLES) {
            return KNOWN_ROLES[activeRoleId as RoleId];
        }
        // Graceful fallback: first available role, or BUYER
        return availableRoles[0] ?? FALLBACK_ROLE;
    }, [activeRoleId, availableRoles]);

    const value = useMemo((): UnifiedAppContextType => ({
        currentUser: { name: displayName, avatar: avatarUrl, availableRoles },
        activeContext: { activeRole: resolvedActiveRole, activeCity: null },
        isProfileOpen,
        setIsProfileOpen,
    }), [displayName, avatarUrl, availableRoles, resolvedActiveRole, isProfileOpen]);

    return (
        <UnifiedAppContext.Provider value={value}>
            {children}
        </UnifiedAppContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useUnifiedApp() {
    return useContext(UnifiedAppContext);
}
