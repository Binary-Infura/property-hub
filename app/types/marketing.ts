// Marketing Campaign Types
export interface Campaign {
    id: string;
    name: string;
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    platform: 'google-ads' | 'facebook' | 'instagram' | 'linkedin' | 'multi-platform';
    budget: number;
    spent: number;
    startDate: Date;
    endDate: Date;
    targetRegions: string[];
    targetProjects: string[];
    assignedTo: string[]; // User IDs of team members
    createdBy: string;
    performance: CampaignPerformance;
    createdAt: Date;
    updatedAt: Date;
}

export interface CampaignPerformance {
    impressions: number;
    clicks: number;
    leads: number;
    conversions: number;
    cpl: number; // Cost per lead
    conversionRate: number;
    roi: number; // Return on investment
}

// Marketing Team Member Types
export interface MarketingTeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    assignedCampaigns: string[];
    performance: TeamMemberPerformance;
    createdAt: Date;
    createdBy: string;
}

export interface TeamMemberPerformance {
    campaignsManaged: number;
    leadsGenerated: number;
    avgCPL: number;
    tasksCompleted: number;
    tasksPending: number;
}

// Budget Types
export interface BudgetAllocation {
    id: string;
    totalBudget: number;
    allocated: number;
    spent: number;
    remaining: number;
    allocations: CampaignBudgetAllocation[];
    period: {
        startDate: Date;
        endDate: Date;
    };
}

export interface CampaignBudgetAllocation {
    campaignId: string;
    campaignName: string;
    amount: number;
    spent: number;
    remaining: number;
}

// Marketing Analytics Types
export interface MarketingAnalytics {
    totalCampaigns: number;
    activeCampaigns: number;
    totalLeads: number;
    totalConversions: number;
    avgCPL: number;
    avgConversionRate: number;
    totalSpent: number;
    budgetUtilization: number;
    performanceByPlatform: PlatformPerformance[];
    performanceByRegion: RegionPerformance[];
}

export interface PlatformPerformance {
    platform: string;
    campaigns: number;
    leads: number;
    conversions: number;
    spent: number;
    cpl: number;
}

export interface RegionPerformance {
    regionId: string;
    regionName: string;
    campaigns: number;
    leads: number;
    conversions: number;
    spent: number;
}

// Marketing Task Types
export interface MarketingTask {
    id: string;
    title: string;
    description: string;
    type: 'campaign-setup' | 'creative-review' | 'performance-analysis' | 'budget-adjustment' | 'other';
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo: string;
    assignedBy: string;
    campaignId?: string;
    dueDate: Date;
    createdAt: Date;
    completedAt?: Date;
}

// Report Types
export interface MarketingReport {
    id: string;
    title: string;
    type: 'monthly' | 'campaign' | 'team' | 'budget' | 'custom';
    period: {
        startDate: Date;
        endDate: Date;
    };
    generatedBy: string;
    generatedAt: Date;
    data: {
        summary: ReportSummary;
        campaigns: Campaign[];
        analytics: MarketingAnalytics;
        teamPerformance: TeamMemberPerformance[];
    };
    sharedWith: string[];
}

export interface ReportSummary {
    totalLeads: number;
    totalConversions: number;
    totalSpent: number;
    avgCPL: number;
    avgConversionRate: number;
    roi: number;
    topPerformingCampaign: string;
    topPerformingPlatform: string;
}
