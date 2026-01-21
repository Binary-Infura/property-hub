export type UserRole =
    | 'central-authority'
    | 'super-admin'
    | 'regional-manager'
    | 'builder'
    | 'consultant'
    | 'channel-partner'
    | 'commission-manager'
    | 'marketing-manager'
    | 'ads-executive'
    | 'creative-executive'
    | 'marketing-lead';

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
    'super-admin': {
        role: 'super-admin',
        label: 'Super Admin',
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
        ],
        canCreateRoles: ['ads-executive', 'creative-executive', 'marketing-lead']
    },
    'ads-executive': {
        role: 'ads-executive',
        label: 'Ads Executive',
        description: 'Manages advertising campaigns and ad execution',
        permissions: [
            { resource: 'marketing-campaigns', actions: ['read', 'update'] },
            { resource: 'ads', actions: ['create', 'read', 'update'] },
            { resource: 'marketing-analytics', actions: ['read'] }
        ]
    },
    'creative-executive': {
        role: 'creative-executive',
        label: 'Creative Executive',
        description: 'Manages creative assets and content creation',
        permissions: [
            { resource: 'creative-assets', actions: ['create', 'read', 'update'] },
            { resource: 'marketing-campaigns', actions: ['read'] },
            { resource: 'content', actions: ['create', 'read', 'update'] }
        ]
    },
    'marketing-lead': {
        role: 'marketing-lead',
        label: 'Marketing Lead',
        description: 'Coordinates marketing team and tracks performance',
        permissions: [
            { resource: 'marketing-campaigns', actions: ['read', 'update'] },
            { resource: 'marketing-team', actions: ['read'] },
            { resource: 'marketing-analytics', actions: ['read'] },
            { resource: 'tasks', actions: ['create', 'read', 'update'] }
        ]
    }
};
