export type UserRole =
    | 'CENTRAL_AUTHORITY'
    | 'PROPERTY_PARTNER'
    | 'GROWTH_PARTNER'
    | 'LOAN_PARTNER'
    | 'BUYER';


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
    'CENTRAL_AUTHORITY': {
        role: 'CENTRAL_AUTHORITY',
        label: 'Central Authority',
        description: 'Platform-wide administrator with full access',
        permissions: [
            { resource: '*', actions: ['create', 'read', 'update', 'delete', 'approve', 'override'] }
        ],
        canCreateRoles: ['GROWTH_PARTNER']
    },


    'PROPERTY_PARTNER': {
        role: 'PROPERTY_PARTNER',
        label: 'Property Partner',
        description: 'Property developer and partner',
        permissions: []
    },
    'LOAN_PARTNER': {
        role: 'LOAN_PARTNER',
        label: 'Loan Partner',
        description: 'Partner for loans',
        permissions: []
    },


    'BUYER': {
        role: 'BUYER',
        label: 'Buyer',
        description: 'End user looking for properties',
        permissions: []
    },
    'GROWTH_PARTNER': {
        role: 'GROWTH_PARTNER',
        label: 'Growth Partner',
        description: 'Lead generation specialist managing campaigns, social media, and promotions',
        permissions: [
            { resource: 'marketing-campaigns', actions: ['create', 'read', 'update', 'delete', 'approve'] },
            { resource: 'marketing-budget', actions: ['create', 'read', 'update', 'approve'] },
            { resource: 'marketing-analytics', actions: ['read'] },
            { resource: 'properties', actions: ['read'] },
            { resource: 'projects', actions: ['read'] }
        ]
    },
};
