'use client';

import { useState } from 'react';

interface Client {
  id: string;
  name: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
}

interface SiteVisit {
  id: string;
  clientId: string;
  propertyId: string;
  scheduledDate: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: string;
}

interface SiteVisitSchedulingProps {
  siteVisits: SiteVisit[];
  properties: Property[];
  clients: Client[];
  onScheduleVisit: (clientId: string, propertyId: string, date: Date) => void;
}

export default function SiteVisitScheduling({
  siteVisits,
  properties,
  clients,
  onScheduleVisit,
}: SiteVisitSchedulingProps) {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>('');
  const [visitTime, setVisitTime] = useState<string>('');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDateOnly = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown';
  };

  const getPropertyTitle = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.title || 'Unknown';
  };

  const getPropertyLocation = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.location || '';
  };

  const getStatusColor = (status: SiteVisit['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClient && selectedProperty && visitDate && visitTime) {
      const dateTime = new Date(`${visitDate}T${visitTime}`);
      onScheduleVisit(selectedClient, selectedProperty, dateTime);
      setSelectedClient('');
      setSelectedProperty('');
      setVisitDate('');
      setVisitTime('');
    }
  };

  const scheduled = siteVisits.filter(v => v.status === 'scheduled');
  const completed = siteVisits.filter(v => v.status === 'completed');
  const cancelled = siteVisits.filter(v => v.status === 'cancelled');

  const renderVisitList = (visits: SiteVisit[], emptyMessage: string) => {
    if (visits.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 font-medium">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {visits.map(visit => (
          <div key={visit.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-gray-900">{getPropertyTitle(visit.propertyId)}</h4>
                <p className="text-sm text-gray-600">{getPropertyLocation(visit.propertyId)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(visit.status)}`}>
                {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong>Client:</strong> {getClientName(visit.clientId)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  <strong>Date & Time:</strong> {formatDate(visit.scheduledDate)}
                </span>
              </div>
            </div>

            {visit.feedback && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Feedback:</p>
                <p className="text-sm text-gray-700">{visit.feedback}</p>
              </div>
            )}

            <div className="flex gap-2">
              {visit.status === 'scheduled' && (
                <>
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium transition text-sm">
                    Mark as Completed
                  </button>
                  <button className="flex-1 border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 font-medium transition text-sm">
                    Cancel Visit
                  </button>
                </>
              )}
              {visit.status === 'completed' && (
                <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 font-medium transition text-sm">
                  Edit Feedback
                </button>
              )}
              <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-medium transition text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Schedule New Visit Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule New Site Visit</h3>
        <form onSubmit={handleScheduleVisit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Choose a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Property</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Choose a property...</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.title} ({property.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Visit Date</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Visit Time</label>
              <input
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedClient || !selectedProperty || !visitDate || !visitTime}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
          >
            Schedule Visit
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Scheduled</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{scheduled.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{completed.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Cancelled</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{cancelled.length}</p>
        </div>
      </div>

      {/* Scheduled Visits */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-blue-600 rounded-full"></span>
          Upcoming Visits ({scheduled.length})
        </h3>
        {renderVisitList(scheduled, 'No scheduled site visits')}
      </div>

      {/* Completed Visits */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-green-600 rounded-full"></span>
          Completed Visits ({completed.length})
        </h3>
        {renderVisitList(completed, 'No completed site visits')}
      </div>

      {/* Cancelled Visits */}
      {cancelled.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-red-600 rounded-full"></span>
            Cancelled Visits ({cancelled.length})
          </h3>
          {renderVisitList(cancelled, 'No cancelled site visits')}
        </div>
      )}
    </div>
  );
}
