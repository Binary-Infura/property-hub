'use client';

import { useState, useMemo } from 'react';
import LeadCard from '@/app/components/LeadCard';
import LeadDetailModal from '@/app/components/LeadDetailModal';
import { Lead, LeadMetrics } from '@/app/types/lead';

export default function LeadsManagerDashboard() {
  // Use fixed reference date to avoid hydration mismatches
  const REFERENCE_DATE = new Date('2024-12-29T10:00:00Z');

  const [leads, setLeads] = useState<Lead[]>([
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
      source: 'Google Ads',
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
      source: 'Facebook Ads',
      status: 'pending-review',
      qualityScore: 65,
      createdAt: new Date(REFERENCE_DATE.getTime() - 5 * 24 * 60 * 60 * 1000),
      tags: ['Young Professional'],
    },
    {
      id: '3',
      name: 'Amit Patel',
      phone: '9098765432',
      location: 'Andheri, Mumbai',
      city: 'Mumbai',
      budget: '₹40L - ₹60L',
      propertyType: '2 BHK',
      buyerIntent: 'end-use',
      source: 'Organic Search',
      status: 'qualified',
      qualityScore: 78,
      createdAt: new Date(REFERENCE_DATE.getTime() - 1 * 24 * 60 * 60 * 1000),
      region: 'West',
      assignedTo: {
        region: 'West',
        assignedAt: new Date(REFERENCE_DATE.getTime() - 12 * 60 * 60 * 1000),
      },
    },
    {
      id: '4',
      name: 'Test User',
      phone: '1234567890',
      location: 'Mumbai',
      budget: 'Not specified',
      propertyType: 'Any',
      buyerIntent: 'end-use',
      source: 'Website',
      status: 'spam',
      qualityScore: 15,
      createdAt: new Date(REFERENCE_DATE.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: '5',
      name: 'Neha Gupta',
      phone: '9765432109',
      email: 'neha@example.com',
      location: 'Pune',
      city: 'Pune',
      budget: '₹30L - ₹50L',
      propertyType: '2 BHK',
      buyerIntent: 'end-use',
      source: 'Referral',
      status: 'qualified',
      qualityScore: 88,
      createdAt: new Date(REFERENCE_DATE.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  // Filter and search leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
      const matchesSource = filterSource === 'all' || lead.source === filterSource;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [leads, searchQuery, filterStatus, filterSource]);

  // Calculate metrics
  const metrics = useMemo<LeadMetrics>(() => {
    const total = leads.length;
    const qualified = leads.filter((l) => l.status === 'qualified').length;
    const pendingReview = leads.filter((l) => l.status === 'pending-review').length;
    const spam = leads.filter((l) => l.status === 'spam').length;
    const assigned = leads.filter((l) => l.assignedTo).length;
    const avgQuality = leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.qualityScore, 0) / leads.length) : 0;

    return {
      totalLeads: total,
      qualifiedLeads: qualified,
      pendingReviewLeads: pendingReview,
      spamLeads: spam,
      assignedLeads: assigned,
      avgQualityScore: avgQuality,
      costPerLead: 250,
      leadToContactRatio: qualified > 0 ? Math.round((assigned / qualified) * 100) : 0,
    };
  }, [leads]);

  const uniqueSources = Array.from(new Set(leads.map((l) => l.source)));

  const handleQualifyLead = (leadId: string) => {
    setLeads(leads.map((lead) =>
      lead.id === leadId ? { ...lead, status: 'qualified', qualityScore: Math.min(100, lead.qualityScore + 10) } : lead
    ));
    setShowModal(false);
  };

  const handleRejectAsSpam = (leadId: string) => {
    setLeads(leads.map((lead) =>
      lead.id === leadId ? { ...lead, status: 'spam', qualityScore: 0 } : lead
    ));
    setShowModal(false);
  };

  const handleAssignRegion = (leadId: string, region: string) => {
    setLeads(leads.map((lead) =>
      lead.id === leadId
        ? {
            ...lead,
            region,
            status: 'assigned',
            assignedTo: { region, assignedAt: new Date() },
          }
        : lead
    ));
    setShowModal(false);
  };

  const handleAddNote = (leadId: string, note: string) => {
    setLeads(leads.map((lead) =>
      lead.id === leadId ? { ...lead, notes: (lead.notes || '') + (lead.notes ? '\n' : '') + note } : lead
    ));
  };

  const toggleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Central Lead Pool</h1>
              <p className="text-gray-600 mt-1">Manage, qualify, and allocate leads to regions</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 font-medium">Lead Quality Index</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{metrics.avgQualityScore}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Leads</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalLeads}</p>
            <p className="text-xs text-gray-500 mt-2">In pipeline</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Qualified Leads</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{metrics.qualifiedLeads}</p>
            <p className="text-xs text-gray-500 mt-2">Ready for assignment</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{metrics.pendingReviewLeads}</p>
            <p className="text-xs text-gray-500 mt-2">Needs validation</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Assigned Leads</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{metrics.assignedLeads}</p>
            <p className="text-xs text-gray-500 mt-2">To regions</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Cost Per Lead</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">₹{metrics.costPerLead}</p>
            <p className="text-xs text-gray-500 mt-2">Average acquisition</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Search</label>
              <input
                type="text"
                placeholder="Name, phone, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="pending-review">Pending Review</option>
                <option value="spam">Spam</option>
                <option value="assigned">Assigned</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                {uniqueSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterSource('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {selectedLeads.size > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <p className="text-sm text-blue-700 font-medium">
                {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
              </p>
              <button
                onClick={() => setSelectedLeads(new Set())}
                className="text-sm text-blue-700 hover:text-blue-900 font-medium"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Leads List */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Leads ({filteredLeads.length})
          </h2>
          {filteredLeads.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600 font-medium">No leads found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isSelected={selectedLeads.has(lead.id)}
                  onSelect={toggleSelectLead}
                  onViewDetails={() => {
                    setSelectedLead(lead);
                    setShowModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => {
            setShowModal(false);
            setSelectedLead(null);
          }}
          onQualify={handleQualifyLead}
          onRejectAsSpam={handleRejectAsSpam}
          onAssignRegion={handleAssignRegion}
          onAddNote={handleAddNote}
        />
      )}
    </div>
  );
}
