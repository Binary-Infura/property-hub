'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

// --- Types ---
export type RoleId =
    | 'central-authority'
    | 'dsa'
    | 'marketing-manager'
    | 'onboarding-manager'
    | 'property-partner'
    | 'consultant'
    | 'loan-adviser'
    | 'visit-executive'
    | 'service-provider'
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
    myCities: CityAllocation[];
    switchContext: (roleId: RoleId) => void;
    switchCity: (city: CityAllocation) => void;
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
    myCities: [],
    switchContext: () => { },
    switchCity: () => { }
};

// --- Context ---
const UnifiedAppContext = createContext<UnifiedAppContextType>(DEFAULT_CONTEXT);

// --- Provider ---
export function UnifiedAppProvider({ children }: { children: ReactNode }) {
    const { user, roles, authenticated, initialized, token } = useAuth();
    const router = useRouter();

    const [activeRole, setActiveRole] = useState<UserRole | null>(null);
    const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
    const [myCities, setMyCities] = useState<CityAllocation[]>([]);
    const [activeCity, setActiveCity] = useState<CityAllocation | null>(null);

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

                // 2. Set activeRole: prefer localStorage → defaultRole → first matched role
                const savedRoleId = localStorage.getItem('activeRoleId') as RoleId | null;
                const defaultRoleId = user?.defaultRole as RoleId | undefined;

                const resolvedRole =
                    (savedRoleId && roleList.find(r => r.id === savedRoleId)) ||
                    (defaultRoleId && roleList.find(r => r.id === defaultRoleId)) ||
                    roleList[0];

                setActiveRole(resolvedRole);
            }

            // 4. Fetch Cities for Manager/Field roles
            const cityBasedRoles: RoleId[] = [
                'marketing-manager',
                'onboarding-manager'
            ];
            if (activeRole && cityBasedRoles.includes(activeRole.id as RoleId) && token) {
                try {
                    const response = await fetch(`${API_URL}/api/cities/allocations/my-cities`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const cities = await response.json();
                        setMyCities(cities);

                        // Set active city
                        const savedCityName = localStorage.getItem('activeCityName');
                        const recoveredCity = cities.find((c: any) => c.cityName === savedCityName);
                        if (recoveredCity) {
                            setActiveCity(recoveredCity);
                        } else if (cities.length > 0) {
                            setActiveCity(cities[0]);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch user cities', error);
                }
            } else {
                setMyCities([]);
                setActiveCity(null);
            }
        };

        syncAppData();
    }, [initialized, authenticated, user, roles, token, activeRole]);

    const switchContext = (roleId: RoleId) => {
        const role = availableRoles.find(r => r.id === roleId);
        if (!role) return;

        setActiveRole(role);
        localStorage.setItem('activeRoleId', roleId);

        console.log(`Switching context to role: ${role.name}`);
        router.push(role.dashboardUrl);
    };

    const switchCity = (city: CityAllocation) => {
        setActiveCity(city);
        localStorage.setItem('activeCityName', city.cityName);
        console.log(`Switching city context to: ${city.cityName}`);
        // Refresh page or trigger context update if needed
        window.location.reload();
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
            activeCity
        },
        myCities,
        switchContext,
        switchCity
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
