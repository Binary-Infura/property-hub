export type UserRole =
    | 'super-admin'
    | 'regional-manager'
    | 'builder'
    | 'consultant'
    | 'channel-partner'
    | 'lead-manager'
    | 'commission-manager';

export interface Permission {
    resource: string;
    actions: ('create' | 'read' | 'update' | 'delete' | 'approve' | 'override')[];
}

export interface RoleDefinition {
    role: UserRole;
    label: string;
    description: string;
    permissions: Permission[];
}

export const ROLES: Record<UserRole, RoleDefinition> = {
    'central-authority': {
        role: 'central-authority',
        label: 'Central Authority',
        description: 'Platform-wide administrator with full access',
        permissions: [
            { resource: '*', actions: ['create', 'read', 'update', 'delete', 'approve', 'override'] }
        ]
    },
    'regional-manager': {
        role: 'regional-manager',
        label: 'Regional Manager',
        description: 'Manager for a specific region',
        permissions: [
            { resource: 'properties', actions: ['read', 'update', 'approve'] },
            { resource: 'users', actions: ['read', 'create', 'update'] } // Limited to region
        ]
    },
    'builder': {
        role: 'builder',
        label: 'Builder',
        description: 'Property developer',
        permissions: []
    },
    'consultant': {
        role: 'consultant',
        label: 'Consultant',
        description: 'Property consultant',
        permissions: []
    },
    'channel-partner': {
        role: 'channel-partner',
        label: 'Channel Partner',
        description: 'External partner',
        permissions: []
    },
    'lead-manager': {
        role: 'lead-manager',
        label: 'Lead Manager',
        description: 'Manages leads',
        permissions: []
    },
    'commission-manager': {
        role: 'commission-manager',
        label: 'Commission Manager',
        description: 'Manages commissions',
        permissions: []
    }
};
