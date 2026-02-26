export type UserRole =
    | 'central-authority'
    | 'dsa'
    | 'property-partner'
    | 'consultant'
    | 'marketing-manager'
    | 'influencer'
    | 'loan-adviser'
    | 'visit-executive'
    | 'onboarding-manager'
    | 'buyer';


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
        canCreateRoles: ['marketing-manager', 'influencer']
    },

    'dsa': {
        role: 'dsa',
        label: 'DSA',
        description: 'Direct Selling Agent',
        permissions: [
            { resource: 'properties', actions: ['create', 'read', 'update'] },
            { resource: 'leads', actions: ['read', 'update'] }
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
    'loan-adviser': {
        role: 'loan-adviser',
        label: 'Loan Adviser',
        description: 'Adviser for loans',
        permissions: []
    },
    'visit-executive': {
        role: 'visit-executive',
        label: 'Visit Executive',
        description: 'Executive for site visits',
        permissions: []
    },
    'onboarding-manager': {
        role: 'onboarding-manager',
        label: 'Onboarding Manager',
        description: 'Manages user onboarding',
        permissions: []
    },
    'buyer': {
        role: 'buyer',
        label: 'Buyer',
        description: 'End user looking for properties',
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
    'influencer': {
        role: 'influencer',
        label: 'Influencer',
        description: 'Marketing influencer responsible for platform promotion',
        permissions: [
            { resource: 'marketing-analytics', actions: ['read'] },
            { resource: 'properties', actions: ['read'] }
        ]
    },
};
