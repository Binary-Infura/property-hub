export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  city?: string;
  region?: string;
  budget: string;
  propertyType: string;
  buyerIntent: 'end-use' | 'investment';
  source: string; // e.g., 'Google Ads', 'Facebook', 'Organic', 'Website'
  status: 'new' | 'qualified' | 'pending-review' | 'spam' | 'assigned';
  qualityScore: number; // 0-100
  createdAt: Date | string;
  assignedTo?: {
    region: string;
    assignedAt: Date | string;
  };
  tags?: string[];
  notes?: string;
}

export interface LeadMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  pendingReviewLeads: number;
  spamLeads: number;
  assignedLeads: number;
  avgQualityScore: number;
  costPerLead: number;
  leadToContactRatio: number;
}

export interface RegionalMetrics {
  region: string;
  leadsReceived: number;
  leadsAssigned: number;
  avgQualityScore: number;
  conversionRate: number;
}

export interface SourceMetrics {
  source: string;
  leadsGenerated: number;
  qualifiedLeads: number;
  costPerLead: number;
  conversionRate: number;
}
