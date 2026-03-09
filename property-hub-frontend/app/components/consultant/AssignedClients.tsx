import React, { useState } from 'react';
import LoanSubmitModal from './LoanSubmitModal';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  budget: string;
  location: string;
  status: 'active' | 'pending' | 'closed';
  assignedDate: Date;
  profileImage: string;
  projectId?: string;
  projectName?: string;
}

interface AssignedClientsProps {
  clients: Client[];
  onSelectClient: (clientId: string) => void;
  selectedClientId: string | null;
  onCallClient?: (client: any) => void;
  onVideoCallClient?: (client: any) => void;
  callingId?: string | null;
}

export default function AssignedClients({ clients, onSelectClient, selectedClientId, onCallClient, onVideoCallClient, callingId }: AssignedClientsProps) {
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [selectedLeadForLoan, setSelectedLeadForLoan] = useState<any>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const activeClients = clients.filter(c => c.status === 'active');
  const pendingClients = clients.filter(c => c.status === 'pending');

  const handleLoanClick = (client: Client) => {
    setSelectedLeadForLoan({
      id: client.id,
      name: client.name,
      projectId: client.projectId,
      projectName: client.projectName
    });
    setIsLoanModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Active Clients */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-green-600 rounded-full"></span>
          Active Leads ({activeClients.length})
        </h3>

        {activeClients.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-600 font-medium">No active leads</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {activeClients.map(client => (
              <div
                key={client.id}
                onClick={() => onSelectClient(client.id)}
                className={`rounded-lg border-2 p-6 transition cursor-pointer ${selectedClientId === client.id
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-md'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {client.profileImage}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{client.name}</h4>
                      <p className="text-sm text-gray-600">Assigned {formatDate(client.assignedDate)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">{client.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502-.684l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1M3 5h18M3 5h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm9 4a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">{client.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">{client.budget}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">{client.location}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onCallClient?.(client); }}
                    disabled={callingId === client.id}
                    className={`w-full ${callingId === client.id ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502-.684l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1M3 5h18M3 5h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm9 4a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {callingId === client.id ? 'Calling...' : 'Call'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onVideoCallClient?.(client); }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Video Call
                  </button>
                  <button className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 font-medium transition text-sm">
                    Schedule Visit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLoanClick(client); }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition text-sm"
                  >
                    Submit Loan
                  </button>
                  <button className="col-span-2 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 font-medium transition text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Clients */}
      {pendingClients.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-yellow-600 rounded-full"></span>
            Pending Leads ({pendingClients.length})
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {pendingClients.map(client => (
              <div
                key={client.id}
                onClick={() => onSelectClient(client.id)}
                className={`rounded-lg border-2 p-6 transition cursor-pointer ${selectedClientId === client.id
                  ? 'border-yellow-500 bg-yellow-50 shadow-md'
                  : 'border-gray-200 hover:border-yellow-300 bg-white hover:shadow-md'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {client.profileImage}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{client.name}</h4>
                      <p className="text-sm text-gray-600">Assigned {formatDate(client.assignedDate)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
                    Pending
                  </span>
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">{client.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502-.684l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1M3 5h18M3 5h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm9 4a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">{client.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">{client.budget}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">{client.location}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onCallClient?.(client); }}
                    disabled={callingId === client.id}
                    className={`w-full ${callingId === client.id ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948-.684l1.498-4.493a1 1 0 011.502-.684l1.498 4.493a1 1 0 00.948.684H19a2 2 0 012 2v1M3 5h18M3 5h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm9 4a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {callingId === client.id ? 'Calling...' : 'Call'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onVideoCallClient?.(client); }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Video Call
                  </button>
                  <button className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 font-medium transition text-sm">
                    Schedule Visit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLoanClick(client); }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition text-sm"
                  >
                    Submit Loan
                  </button>
                  <button className="col-span-2 w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 font-medium transition text-sm">
                    Schedule Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedLeadForLoan && (
        <LoanSubmitModal
          isOpen={isLoanModalOpen}
          onClose={() => {
            setIsLoanModalOpen(false);
            setSelectedLeadForLoan(null);
          }}
          lead={selectedLeadForLoan}
        />
      )}
    </div>
  );
}
