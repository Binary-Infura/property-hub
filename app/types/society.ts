/**
 * Society Types
 * Defines interfaces for Society management in PropertyHub
 */

// Possession status of the project
export type PossessionStatus = 'under-construction' | 'ready' | 'handed-over';

// Handover status to RWA/Society
export type HandoverStatus = 'builder-managed' | 'transitioning' | 'fully-handed-over';

// Member type
export type MemberType = 'owner' | 'tenant';

// Role types in society
export type SocietyRoleType = 'regional-manager' | 'manager' | 'supervisor' | 'member';

/**
 * Tower/Wing structure within a society
 */
export interface SocietyTower {
    id: string;
    name: string;                    // e.g., "Tower A", "Wing B"
    totalFloors: number;
    floorStart: number;              // e.g., 1 (ground floor numbering)
    unitsPerFloor: number;
    flatNumberingPattern: string;    // e.g., "101, 102..." or "A-101, A-102..."
    totalUnits: number;
}

/**
 * Amenity in the society
 */
export interface SocietyAmenity {
    id: string;
    name: string;
    type: 'parking' | 'clubhouse' | 'gym' | 'pool' | 'garden' | 'lift' | 'security' | 'other';
    description?: string;
    isActive: boolean;
}

/**
 * Role assignment in society
 */
export interface SocietyRole {
    id: string;
    userId?: string;
    name: string;
    email?: string;
    mobile?: string;
    role: SocietyRoleType;
    assignedAt: Date;
    assignedBy: string;
    isActive: boolean;
}

/**
 * Member (flat owner/tenant) in society
 */
export interface SocietyMember {
    id: string;
    name: string;
    email?: string;
    mobile: string;
    towerId: string;
    towerName: string;
    flatNumber: string;
    floor: number;
    memberType: MemberType;
    isVerified: boolean;
    invitedAt: Date;
    joinedAt?: Date;
    invitedBy: string;
}

/**
 * Society entity - main interface
 */
export interface Society {
    id: string;
    name: string;

    // Project linkage (optional)
    projectId?: string;
    projectName: string;

    // Location
    address: string;
    city: string;
    state: string;
    pincode: string;

    // Structure
    totalTowers: number;
    totalUnits: number;
    towers: SocietyTower[];
    amenities: SocietyAmenity[];

    // Status
    possessionStatus: PossessionStatus;
    handoverStatus: HandoverStatus;
    expectedHandoverDate?: Date;
    actualHandoverDate?: Date;

    // Roles
    roles: SocietyRole[];

    // Members
    members: SocietyMember[];

    // Services enabled
    services: {
        maintenance: boolean;
        security: boolean;
        facilityManagement: boolean;
    };

    // Meta
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    isLocked: boolean;              // Read-only after full handover
}

/**
 * Form data for creating a society
 */
export interface SocietyFormData {
    // Step 1: Basic Info
    name: string;
    projectId?: string;
    projectName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    possessionStatus: PossessionStatus;
    expectedHandoverDate?: string;

    // Step 2: Structure
    towers: Omit<SocietyTower, 'id'>[];
    amenities: string[];

    // Step 3: Roles
    regionalManagerName: string;
    regionalManagerEmail: string;
    regionalManagerMobile: string;
    managerName?: string;
    managerEmail?: string;
    managerMobile?: string;
    supervisorName?: string;
    supervisorEmail?: string;
    supervisorMobile?: string;
}

/**
 * Society card display props
 */
export interface SocietyCardProps {
    society: Society;
    onView: (id: string) => void;
    onManage: (id: string) => void;
}
