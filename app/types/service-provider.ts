export type ServiceCategory =
    | 'painting'
    | 'plumbing'
    | 'electrical'
    | 'carpentry'
    | 'cleaning'
    | 'pest-control'
    | 'appliance-repair'
    | 'interior-design'
    | 'furniture'
    | 'other';

export type ServiceProviderStatus = 'active' | 'inactive' | 'pending-approval';

export interface ServiceProviderAvailability {
    days: string[]; // e.g., ["Monday", "Tuesday"]
    hours: string; // e.g., "09:00 AM - 06:00 PM"
}

export interface ServiceProvider {
    id: string;
    firstName: string;
    lastName?: string;
    businessName?: string;
    email: string;
    phone: string;
    category: ServiceCategory;
    serviceArea: string; // Could be a city or specific region text
    availability: ServiceProviderAvailability;
    rates: string; // e.g., "$20/hr" or "Fixed per job" description
    portfolio?: string[]; // URLs to images

    // Performance metrics
    rating: number;
    jobsCompleted: number;

    status: ServiceProviderStatus;
    joinedAt: Date;
    regions?: string[]; // IDs of regions they operate in
    assignedTo?: string[]; // IDs of builders/consultants they are assigned to
}

export interface ServiceProviderFormData {
    firstName: string;
    lastName?: string;
    businessName?: string;
    category: ServiceCategory;
    location: string;
    phone: string;
    email: string;
    availabilityDays: string[];
    availabilityHours: string;
    rates: string;
    portfolio: File[]; // For upload
}
