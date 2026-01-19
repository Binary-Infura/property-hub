import { DashboardStats, RegionPerformance, ActivityLog } from '@/app/types/central-authority';

export const MOCK_DASHBOARD_STATS: DashboardStats = {
    totalRegions: 12,
    properties: {
        active: 1450,
        pending: 45,
        inactive: 120,
    },
    users: {
        builders: 85,
        consultants: 320,
        partners: 50,
    },
    siteVisits: {
        scheduled: 125,
        completed: 850,
    },
    leads: {
        daily: 45,
        weekly: 310,
        monthly: 1250,
    }
};

export const MOCK_REGIONS: RegionPerformance[] = [
    { id: '1', name: 'Mumbai South', managers: ['Rajesh Kumar', 'Simran Kaur'], status: 'active', propertiesCount: 450, leadsGenerated: 1200, revenue: 2500000 },
    { id: '2', name: 'Pune West', managers: ['Sneha Patil'], status: 'active', propertiesCount: 320, leadsGenerated: 850, revenue: 1800000 },
    { id: '3', name: 'Bangalore North', managers: ['Amit Sharma', 'John Doe'], status: 'active', propertiesCount: 280, leadsGenerated: 780, revenue: 1600000 },
    { id: '4', name: 'Hyderabad Tech City', managers: ['Priya Reddy'], status: 'active', propertiesCount: 350, leadsGenerated: 920, revenue: 2100000 },
    { id: '5', name: 'Delhi NCR', managers: ['Vikram Singh'], status: 'warning', propertiesCount: 50, leadsGenerated: 120, revenue: 450000 },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
    { id: '1', action: 'Override Approval', user: 'Central Authority', target: 'Property #1234', timestamp: '2024-03-10T10:30:00Z', type: 'warning' },
    { id: '2', action: 'Region Created', user: 'Central Authority', target: 'Chennai South', timestamp: '2024-03-09T14:15:00Z', type: 'info' },
    { id: '3', action: 'User Suspended', user: 'Central Authority', target: 'Consultant #555', timestamp: '2024-03-09T09:00:00Z', type: 'alert' },
];
