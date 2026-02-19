'use client';

import { useState } from 'react';
import { Lead } from '@/app/types/lead';

interface AssignedLeadsListProps {
  leads: Lead[];
  onUpdateStatus: (leadId: string, newStatus: Lead['status']) => void;
}

export default function AssignedLeadsList({ leads, onUpdateStatus }: AssignedLeadsListProps) {
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | Lead['status']>('all');

  const filteredLeads = filterStatus === 'all' ? leads : leads.filter(lead => lead.status === filterStatus);

  const getStatusColor = (status: Lead['status']) => {
    const colors: Record<Lead['status'], string> = {
      new: 'bg-blue-100 text-blue-800',
      qualified: 'bg-green-100 text-green-800',
      'pending-review': 'bg-yellow-100 text-yellow-800',
      spam: 'bg-red-100 text-red-800',
      assigned: 'bg-purple-100 text-purple-800',
    };
    return colors[status];
  };

  const getStatusLabel = (status: Lead['status']) => {
    const labels: Record<Lead['status'], string> = {
      new: 'New',
      qualified: 'Qualified',
      'pending-review': 'Pending Review',
      spam: 'Spam',
      assigned: 'Assigned',
    };
    return labels[status];
  };

  const getQualityIndicator = (score: number) => {
    if (score >= 80) return { color: 'text-green-600', label: 'High Quality' };
    if (score >= 60) return { color: 'text-yellow-600', label: 'Medium Quality' };
    return { color: 'text-red-600', label: 'Low Quality' };
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Leads</option>
            <option value="new">New</option>
            <option value="qualified">Qualified</option>
            <option value="pending-review">Pending Review</option>
            <option value="assigned">Assigned</option>
            <option value="spam">Spam</option>
          </select>
        </div>
      </div>

      {/* Leads Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 font-medium">Total Leads</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{leads.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-600 font-medium">Qualified</p>
          <p className="text-xl font-bold text-green-700 mt-1">{leads.filter(l => l.status === 'qualified').length}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-600 font-medium">Pending</p>
          <p className="text-xl font-bold text-yellow-700 mt-1">{leads.filter(l => l.status === 'pending-review').length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs text-purple-600 font-medium">Assigned</p>
          <p className="text-xl font-bold text-purple-700 mt-1">{leads.filter(l => l.status === 'assigned').length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium">Avg Quality</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{Math.round(leads.reduce((a, b) => a + b.qualityScore, 0) / leads.length)}</p>
        </div>
      </div>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600 font-medium">No leads found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or submit new leads</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map(lead => {
            const quality = getQualityIndicator(lead.qualityScore);
            const isExpanded = expandedLeadId === lead.id;

            return (
              <div
                key={lead.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
              >
                {/* Lead Card Header */}
                <div
                  onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                  className="p-4 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">{lead.name}</h3>
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          {getStatusLabel(lead.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600">
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{lead.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium text-gray-900">{lead.location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Budget</p>
                          <p className="font-medium text-gray-900">{lead.budget}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Quality Score</p>
                          <p className={`font-medium ${quality.color}`}>{lead.qualityScore} - {quality.label}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 space-y-4">
                    {/* Lead Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                        <p className="text-sm text-gray-900">{lead.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Property Type</p>
                        <p className="text-sm text-gray-900">{lead.propertyType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Buyer Intent</p>
                        <p className="text-sm text-gray-900 capitalize">{lead.buyerIntent}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Source</p>
                        <p className="text-sm text-gray-900">{lead.source}</p>
                      </div>
                    </div>

                    {lead.tags && lead.tags.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {lead.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lead Notes */}
                    {lead.notes && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
                        <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                          {lead.notes}
                        </p>
                      </div>
                    )}

                    {/* Status Update Buttons */}
                    {lead.status !== 'qualified' && lead.status !== 'assigned' && (
                      <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                        {lead.status === 'new' && (
                          <button
                            onClick={() => onUpdateStatus(lead.id, 'qualified')}
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition text-sm"
                          >
                            Mark as Qualified
                          </button>
                        )}
                        {lead.status === 'pending-review' && (
                          <>
                            <button
                              onClick={() => onUpdateStatus(lead.id, 'qualified')}
                              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onUpdateStatus(lead.id, 'spam')}
                              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition text-sm"
                            >
                              Mark as Spam
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
