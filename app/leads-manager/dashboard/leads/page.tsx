'use client';

import { useState, useMemo } from 'react';
import LeadCard from '@/app/components/LeadCard';
import LeadDetailModal from '@/app/components/LeadDetailModal';
import { Lead } from '@/app/types/lead';

export default function LeadsPoolPage() {
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
    {
      id: '6',
      name: 'Vikram Desai',
      phone: '8765432109',
      email: 'vikram@example.com',
      location: 'Chembur, Mumbai',
      city: 'Mumbai',
      budget: '₹60L - ₹85L',
      propertyType: '2 BHK',
      buyerIntent: 'investment',
      source: 'Google Ads',
      status: 'qualified',
      qualityScore: 82,
      createdAt: new Date(REFERENCE_DATE.getTime() - 4 * 24 * 60 * 60 * 1000),
      tags: ['Investor', 'Flexible'],
    },
    {
      id: '7',
      name: 'Anjali Sharma',
      phone: '7654321098',
      email: 'anjali@example.com',
      location: 'Whitefield, Bangalore',
      city: 'Bangalore',
      budget: '₹50L - ₹75L',
      propertyType: '3 BHK',
      buyerIntent: 'end-use',
      source: 'Facebook Ads',
      status: 'pending-review',
      qualityScore: 70,
      createdAt: new Date(REFERENCE_DATE.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: '8',
      name: 'Suresh Reddy',
      phone: '6543210987',
      location: 'Hyderabad',
      budget: '₹25L - ₹40L',
      propertyType: '2 BHK',
      buyerIntent: 'end-use',
      source: 'Organic Search',
      status: 'qualified',
      qualityScore: 80,
      createdAt: new Date(REFERENCE_DATE.getTime() - 6 * 24 * 60 * 60 * 1000),
      region: 'South',
      assignedTo: {
        region: 'South',
        assignedAt: new Date(REFERENCE_DATE.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    },
  ]);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'quality-high' | 'quality-low'>('date-desc');

  const uniqueCities = Array.from(new Set(leads.filter((l) => l.city).map((l) => l.city as string)));

  // Filter and search leads
  const filteredLeads = useMemo(() => {
    let result = leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
      const matchesCity = filterCity === 'all' || lead.city === filterCity;

      return matchesSearch && matchesStatus && matchesCity;
    });

    // Sort
    if (sortBy === 'date-desc') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'date-asc') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'quality-high') {
      result.sort((a, b) => b.qualityScore - a.qualityScore);
    } else if (sortBy === 'quality-low') {
      result.sort((a, b) => a.qualityScore - b.qualityScore);
    }

    return result;
  }, [leads, searchQuery, filterStatus, filterCity, sortBy]);

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

  const bulkQualify = () => {
    if (selectedLeads.size === 0) return;
    setLeads(leads.map((lead) =>
      selectedLeads.has(lead.id)
        ? { ...lead, status: 'qualified', qualityScore: Math.min(100, lead.qualityScore + 10) }
        : lead
    ));
    setSelectedLeads(new Set());
  };

  const bulkRejectAsSpam = () => {
    if (selectedLeads.size === 0 || !confirm('Mark all selected leads as spam?')) return;
    setLeads(leads.map((lead) =>
      selectedLeads.has(lead.id) ? { ...lead, status: 'spam', qualityScore: 0 } : lead
    ));
    setSelectedLeads(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Complete Lead Pool</h1>
          <p className="text-gray-600 mt-1">Manage all incoming leads in one centralized location</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid md:grid-cols-5 gap-4 mb-4">
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
              <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="quality-high">Highest Quality</option>
                <option value="quality-low">Lowest Quality</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setFilterCity('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedLeads.size > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <p className="text-sm text-blue-700 font-medium">
                {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={bulkQualify}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded font-medium hover:bg-green-700 transition"
                >
                  Qualify All
                </button>
                <button
                  onClick={bulkRejectAsSpam}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded font-medium hover:bg-red-700 transition"
                >
                  Mark as Spam
                </button>
                <button
                  onClick={() => setSelectedLeads(new Set())}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded font-medium hover:bg-gray-400 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Leads List */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Leads ({filteredLeads.length} of {leads.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filterStatus !== 'all' && `Status: ${filterStatus} • `}
              {filterCity !== 'all' && `City: ${filterCity}`}
            </p>
          </div>

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
