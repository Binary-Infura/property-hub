export type UserRole =
    | 'central-authority'

    | 'regional-manager'
    | 'property-partner'
    | 'consultant'
    | 'channel-partner'
    | 'commission-manager'
    | 'marketing-manager'


export interface Permission {
    resource: string;
    actions: ('create' | 'read' | 'update' | 'delete' | 'approve' | 'override')[];
}

export interface RoleDefinition {
    role: UserRole;
    label: string;
    description: string;
    permissions: Permission[];
    canCreateRoles?: UserRole[];
}

export const ROLES: Record<UserRole, RoleDefinition> = {
    'central-authority': {
        role: 'central-authority',
        label: 'Central Authority',
        description: 'Platform-wide administrator with full access',
        permissions: [
            { resource: '*', actions: ['create', 'read', 'update', 'delete', 'approve', 'override'] }
        ],
        canCreateRoles: ['marketing-manager', 'regional-manager']
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
    'property-partner': {
        role: 'property-partner',
        label: 'Property Partner',
        description: 'Property developer and partner',
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
    'commission-manager': {
        role: 'commission-manager',
        label: 'Commission Manager',
        description: 'Manages commissions',
        permissions: []
    },
    'marketing-manager': {
        role: 'marketing-manager',
        label: 'Marketing Manager',
        description: 'Head of marketing department with full team and campaign management',
        permissions: [
            { resource: 'marketing-campaigns', actions: ['create', 'read', 'update', 'delete', 'approve'] },
            { resource: 'marketing-team', actions: ['create', 'read', 'update', 'delete'] },
            { resource: 'marketing-budget', actions: ['create', 'read', 'update', 'approve'] },
            { resource: 'marketing-analytics', actions: ['read'] },
            { resource: 'regions', actions: ['read'] },
            { resource: 'builders', actions: ['read'] },
            { resource: 'projects', actions: ['read'] }
        ]
    },
};
