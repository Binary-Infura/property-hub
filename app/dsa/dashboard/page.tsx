'use client';

import { useState } from 'react';
import LeadSubmissionForm from '@/app/components/dsa/LeadSubmissionForm';
import CommissionTracking from '@/app/components/dsa/CommissionTracking';
import PropertyPromotions from '@/app/components/dsa/PropertyPromotions';
import AssignedLeadsList from '@/app/components/dsa/AssignedLeadsList';
import PerformanceMetrics from '@/app/components/dsa/PerformanceMetrics';
import AddPropertyModal from '@/app/components/dsa/AddPropertyModal';
import { Lead } from '@/app/types/lead';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import NoAllocationPlaceholder from '@/app/components/dashboard/NoAllocationPlaceholder';

interface Commission {
  id: string;
  leadId: string;
  leadName: string;
  propertyId?: string;
  propertyTitle?: string;
  status: 'pending' | 'approved' | 'paid';
  amount: number;
  date: Date;
  description: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  config: string;
  builder: string;
  promotionMaterials: string[];
  assignedToPartners: string[];
}

interface PartnerMetrics {
  leadsSubmitted: number;
  leadsConverted: number;
  conversionRate: number;
  totalEarnings: number;
  monthlyEarnings: number;
  topProperty: string;
}

export default function DsaDashboard() {
  const { activeContext } = useUnifiedApp();
  const REFERENCE_DATE = new Date('2024-12-29T10:00:00Z');

  const [assignedLeads, setAssignedLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Rajesh Kumar',
      phone: '9876543210',
      email: 'rajesh@example.com',
      location: 'Bandra, Mumbai',
      city: 'Mumbai',
      budget: '₹75L - ₹1Cr',
      propertyType: '3 BHK',
      buyerIntent: 'end-use',
      source: 'Channel Partner - Amit',
      status: 'qualified',
      qualityScore: 85,
      createdAt: new Date(REFERENCE_DATE.getTime() - 2 * 24 * 60 * 60 * 1000),
      tags: ['High Budget', 'Verified Phone'],
    },
    {
      id: '2',
      name: 'Priya Singh',
      phone: '9123456789',
      email: 'priya@example.com',
      location: 'Powai, Mumbai',
      city: 'Mumbai',
      budget: '₹50L - ₹75L',
      propertyType: '2 BHK',
      buyerIntent: 'investment',
      source: 'Channel Partner - Amit',
      status: 'pending-review',
      qualityScore: 65,
      createdAt: new Date(REFERENCE_DATE.getTime() - 5 * 24 * 60 * 60 * 1000),
      tags: ['Young Professional'],
    },
    {
      id: '3',
      name: 'Neha Gupta',
      phone: '9765432109',
      email: 'neha@example.com',
      location: 'Pune',
      city: 'Pune',
      budget: '₹30L - ₹50L',
      propertyType: '2 BHK',
      buyerIntent: 'end-use',
      source: 'Channel Partner - Amit',
      status: 'qualified',
      qualityScore: 88,
      createdAt: new Date(REFERENCE_DATE.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [commissions, setCommissions] = useState<Commission[]>([
    {
      id: 'c1',
      leadId: '1',
      leadName: 'Rajesh Kumar',
      propertyId: 'p1',
      propertyTitle: 'Sunset Towers, Bandra',
      status: 'approved',
      amount: 150000,
      date: new Date(REFERENCE_DATE.getTime() - 10 * 24 * 60 * 60 * 1000),
      description: 'Commission for lead qualification',
    },
    {
      id: 'c2',
      leadId: '2',
      leadName: 'Priya Singh',
      status: 'pending',
      amount: 50000,
      date: new Date(REFERENCE_DATE.getTime() - 5 * 24 * 60 * 60 * 1000),
      description: 'Commission pending review',
    },
    {
      id: 'c3',
      leadId: '3',
      leadName: 'Neha Gupta',
      propertyId: 'p2',
      propertyTitle: 'Green Valley Homes, Powai',
      status: 'paid',
      amount: 120000,
      date: new Date(REFERENCE_DATE.getTime() - 15 * 24 * 60 * 60 * 1000),
      description: 'Commission paid for closed deal',
    },
  ]);

  const [promotedProperties, setPromotedProperties] = useState<Property[]>([
    {
      id: 'p1',
      title: 'Sunset Towers, Bandra',
      location: 'Bandra, Mumbai',
      price: '₹85L',
      config: '3 BHK',
      builder: 'Premium Developers',
      promotionMaterials: ['Brochure', 'Video Tour', 'Site Photos', 'Virtual Walkthrough'],
      assignedToPartners: ['cp1'],
    },
    {
      id: 'p2',
      title: 'Green Valley Homes, Powai',
      location: 'Powai, Mumbai',
      price: '₹52L',
      config: '2 BHK',
      builder: 'Quality Constructions',
      promotionMaterials: ['Brochure', 'Site Photos', 'Floor Plans'],
      assignedToPartners: ['cp1'],
    },
    {
      id: 'p3',
      title: 'Luxury Heights, Worli',
      location: 'Worli, Mumbai',
      price: '₹1.2Cr',
      config: '4 BHK',
      builder: 'Elite Properties',
      promotionMaterials: ['Premium Brochure', 'Video Tour', 'Site Photos', 'Virtual Walkthrough', 'Drone Footage'],
      assignedToPartners: ['cp1'],
    },
  ]);

  const metrics: PartnerMetrics = {
    leadsSubmitted: assignedLeads.length + 5,
    leadsConverted: 3,
    conversionRate: (3 / (assignedLeads.length + 5)) * 100,
    totalEarnings: 320000,
    monthlyEarnings: 150000,
    topProperty: 'Sunset Towers, Bandra',
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'leads' | 'submit' | 'commissions' | 'properties' | 'performance'>(
    'leads'
  );

  const handleAddLead = (newLead: Omit<Lead, 'id' | 'createdAt' | 'qualityScore'>) => {
    const lead: Lead = {
      ...newLead,
      id: Date.now().toString(),
      createdAt: new Date(),
      qualityScore: 75,
      source: `Channel Partner - ${newLead.source || 'Direct'}`,
    };
    setAssignedLeads([...assignedLeads, lead]);
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    setAssignedLeads(
      assignedLeads.map(lead => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    );
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">DSA Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage leads, track commissions, and create properties</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm active:transform active:scale-95"
          >
            + Create Property
          </button>
        </div>
      </div>

      <AddPropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editId={null}
        onSuccess={() => alert('Property created successfully!')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Leads Submitted</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.leadsSubmitted}</p>
            <p className="text-xs text-gray-500 mt-2">Total submitted</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{metrics.conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-2">{metrics.leadsConverted} converted</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">₹{(metrics.totalEarnings / 100000).toFixed(1)}L</p>
            <p className="text-xs text-gray-500 mt-2">Lifetime earnings</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">This Month</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">₹{(metrics.monthlyEarnings / 100000).toFixed(1)}L</p>
            <p className="text-xs text-gray-500 mt-2">Monthly earnings</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Top Property</p>
            <p className="text-sm font-bold text-orange-600 mt-2 line-clamp-2">{metrics.topProperty}</p>
            <p className="text-xs text-gray-500 mt-2">Most promoted</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'leads'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Assigned Leads
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'submit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Submit New Lead
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'commissions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Commissions
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'properties'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Properties to Promote
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'performance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Performance
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'leads' && (
              <AssignedLeadsList
                leads={assignedLeads}
                onUpdateStatus={handleUpdateLeadStatus}
              />
            )}
            {activeTab === 'submit' && (
              <LeadSubmissionForm onSubmit={handleAddLead} />
            )}
            {activeTab === 'commissions' && (
              <CommissionTracking commissions={commissions} />
            )}
            {activeTab === 'properties' && (
              <PropertyPromotions properties={promotedProperties} />
            )}
            {activeTab === 'performance' && (
              <PerformanceMetrics metrics={metrics} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
