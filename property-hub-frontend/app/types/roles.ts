export type UserRole =
    | 'CENTRAL_AUTHORITY'
    | 'DSA'
    | 'PROPERTY_PARTNER'
    | 'CONSULTANT'
    | 'MARKETING_MANAGER'
    | 'INFLUENCER'
    | 'LOAN_ADVISOR'

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
        canCreateRoles: ['MARKETING_MANAGER', 'INFLUENCER']
    },

    'DSA': {
        role: 'DSA',
        label: 'DSA',
        description: 'Direct Selling Agent',
        permissions: [
            { resource: 'properties', actions: ['create', 'read', 'update'] },
            { resource: 'leads', actions: ['read', 'update'] }
        ]
    },
    'PROPERTY_PARTNER': {
        role: 'PROPERTY_PARTNER',
        label: 'Property Partner',
        description: 'Property developer and partner',
        permissions: []
    },
    'CONSULTANT': {
        role: 'CONSULTANT',
        label: 'Consultant',
        description: 'Property consultant',
        permissions: []
    },
    'LOAN_ADVISOR': {
        role: 'LOAN_ADVISOR',
        label: 'Loan Advisor',
        description: 'Advisor for loans',
        permissions: []
    },


    'BUYER': {
        role: 'BUYER',
        label: 'Buyer',
        description: 'End user looking for properties',
        permissions: []
    },
    'MARKETING_MANAGER': {
        role: 'MARKETING_MANAGER',
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
    'INFLUENCER': {
        role: 'INFLUENCER',
        label: 'Influencer',
        description: 'Marketing influencer responsible for platform promotion',
        permissions: [
            { resource: 'marketing-analytics', actions: ['read'] },
            { resource: 'properties', actions: ['read'] }
        ]
    },
};
