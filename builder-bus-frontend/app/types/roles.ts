export type UserRole =
    | 'CENTRAL_AUTHORITY'
    | 'PROPERTY_PARTNER'
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
        ]
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

};
