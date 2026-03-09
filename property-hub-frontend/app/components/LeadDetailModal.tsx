'use client';

import { useState } from 'react';
import { Lead } from '@/app/types/lead';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onQualify?: (leadId: string) => void;
  onRejectAsSpam?: (leadId: string) => void;
  onAssignCity?: (leadId: string, city: string) => void;
  onAddNote?: (leadId: string, note: string) => void;
}

const CITIES = ['North', 'South', 'East', 'West', 'Central'];

export default function LeadDetailModal({
  lead,
  onClose,
  onQualify,
  onRejectAsSpam,
  onAssignCity,
  onAddNote,
}: LeadDetailModalProps) {
  const [newNote, setNewNote] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'assign'>('details');

  if (!lead) return null;

  const handleQualify = () => {
    onQualify?.(lead.id);
  };

  const handleRejectAsSpam = () => {
    if (confirm('Are you sure you want to mark this lead as spam?')) {
      onRejectAsSpam?.(lead.id);
    }
  };

  const handleAssignCity = () => {
    if (selectedCity) {
      onAssignCity?.(lead.id, selectedCity);
      setSelectedCity('');
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote?.(lead.id, newNote);
      setNewNote('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified':
        return 'text-green-700 bg-green-50';
      case 'pending-review':
        return 'text-yellow-700 bg-yellow-50';
      case 'spam':
        return 'text-red-700 bg-red-50';
      case 'assigned':
        return 'text-blue-700 bg-blue-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
            <p className="text-gray-600 text-sm mt-1">{lead.phone}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-2xl"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-6 py-3 font-medium border-b-2 transition ${activeTab === 'details'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-6 py-3 font-medium border-b-2 transition ${activeTab === 'notes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            Internal Notes
          </button>
          <button
            onClick={() => setActiveTab('assign')}
            className={`flex-1 px-6 py-3 font-medium border-b-2 transition ${activeTab === 'assign'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            Assign City
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Status Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Current Status</p>
                    <span className={`inline-block mt-2 px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(lead.status)}`}>
                      {lead.status === 'pending-review' ? 'Pending Review' : lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-medium">Quality Score</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{lead.qualityScore}%</p>
                  </div>
                </div>
              </div>

              {/* Lead Information Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Phone</p>
                      <p className="text-gray-900">{lead.phone}</p>
                    </div>
                    {lead.email && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Email</p>
                        <p className="text-gray-900">{lead.email}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Received Date</p>
                      <p className="text-gray-900">
                        {new Date(lead.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Property Preferences */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Preferences</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Location</p>
                      <p className="text-gray-900">{lead.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Budget</p>
                      <p className="text-gray-900">{lead.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Property Type</p>
                      <p className="text-gray-900">{lead.propertyType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Buying Intent</p>
                      <p className="text-gray-900 capitalize">{lead.buyerIntent}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Source and Classification */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Source & Classification</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Source</p>
                      <p className="text-gray-900">{lead.source}</p>
                    </div>
                    {lead.city && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium">City</p>
                        <p className="text-gray-900">{lead.city}</p>
                      </div>
                    )}
                    {lead.region && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Assigned City</p>
                        <p className="text-gray-900">{lead.region}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {lead.tags && lead.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {lead.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-blue-50 rounded-lg p-4 flex gap-3">
                <button
                  onClick={handleQualify}
                  disabled={lead.status === 'qualified'}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Qualify Lead
                  </span>
                </button>
                <button
                  onClick={handleRejectAsSpam}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Mark as Spam
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Internal Note</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this lead..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes History</h3>
                {lead.notes ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{lead.notes}</p>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No notes added yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assign' && (
            <div className="space-y-6">
              {lead.assignedTo ? (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-700 font-medium">This lead is already assigned</p>
                  <p className="text-gray-900 mt-2">
                    <strong>City:</strong> {lead.assignedTo.region}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Assigned on: {new Date(lead.assignedTo.assignedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-3">
                    Note: City assignments cannot be modified once set.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                      Select City for Assignment
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {CITIES.map((city) => (
                        <button
                          key={city}
                          onClick={() => setSelectedCity(city)}
                          className={`p-4 rounded-lg border-2 font-medium transition text-center ${selectedCity === city
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedCity && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-700">
                        Lead will be assigned to <strong>{selectedCity} City</strong>
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        Once assigned, this lead cannot be moved to another city.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleAssignCity}
                    disabled={!selectedCity}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    Confirm Assignment
                  </button>

                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm text-yellow-800 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Important Restriction
                    </p>
                    <p className="text-xs text-yellow-700 mt-2">
                      Once a lead is assigned to a city, the assignment cannot be modified. Ensure the lead is properly qualified before assigning.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
