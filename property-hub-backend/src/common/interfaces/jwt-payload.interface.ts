import { UserRole } from '../enums/role.enum';

export interface JwtPayload {
    sub: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    activeRole: string;
    phone?: string;
}

export interface AuthenticatedUser {
    userId: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    roles: string[];   // Raw from JWT — may still be kebab-case; normalize via normalizeRole()
    activeRole: string;
    phone?: string;
}
