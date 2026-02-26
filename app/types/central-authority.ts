export interface DashboardStats {
    totalCities: number;
    properties: {
        active: number;
        pending: number;
        inactive: number;
    };
    users: {
        builders: number;
        consultants: number;
        partners: number;
    };
    siteVisits: {
        scheduled: number;
        completed: number;
    };
    leads: {
        daily: number;
        weekly: number;
        monthly: number;
    };
}

export interface CityPerformance {
    id: string;
    name: string;
    managers: string[];
    status: 'active' | 'inactive' | 'warning';
    propertiesCount: number;
    leadsGenerated: number;
    revenue: number;
}

export interface ActivityLog {
    id: string;
    action: string;
    user: string;
    target: string;
    timestamp: string;
    type: 'info' | 'warning' | 'alert';
}
