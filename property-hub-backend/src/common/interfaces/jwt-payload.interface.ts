/**
 * Structure for region-specific roles
 * Each region can have multiple roles assigned to a user
 */
export interface RegionRoles {
    [region: string]: {
        roles: string[];
    };
}

export interface JwtPayload {
    sub: string; // Subject (user ID)
    email?: string;
    preferred_username?: string;

    // Realm roles - only 'buyer' or 'internal'
    realm_access?: {
        roles: string[];
    };

    // Region-specific roles from Keycloak user attribute
    // Mapped via protocol mapper as JSON claim
    regions?: RegionRoles;

    // Standard JWT claims
    iss?: string; // Issuer
    iat?: number; // Issued at
    exp?: number; // Expiration
    azp?: string; // Authorized party
}

export interface AuthenticatedUser {
    userId: string;
    email?: string;
    username?: string;
    realmRole: 'buyer' | 'internal'; // Single realm role
    regionRoles: RegionRoles; // Region-specific roles
    isCentralAuthority: boolean; // Special flag for central authority
}
