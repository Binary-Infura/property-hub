// No longer using region-specific roles in JWT interface

export interface JwtPayload {
    sub?: string; // Subject (user ID)
    email?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;

    // Realm roles
    realm_access?: {
        roles: string[];
    };

    // Keycloak groups/paths
    groups?: string[];
    phone?: string;
}

export interface AuthenticatedUser {
    userId: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    roles: string[]; // Realm roles
    groups: string[]; // Region groups
    phone?: string;
}
