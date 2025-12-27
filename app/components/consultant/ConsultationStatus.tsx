interface Client {
  id: string;
  name: string;
}

interface ConsultationRecord {
  id: string;
  clientId: string;
  type: 'initial' | 'follow-up' | 'site-visit' | 'negotiation';
  date: Date;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  duration: number;
}

interface ConsultationStatusProps {
  consultations: ConsultationRecord[];
  clients: Client[];
}

export default function ConsultationStatus({ consultations, clients }: ConsultationStatusProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: ConsultationRecord['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: ConsultationRecord['type']) => {
    switch (type) {
      case 'initial':
        return 'from-purple-500 to-purple-600';
      case 'follow-up':
        return 'from-blue-500 to-blue-600';
      case 'site-visit':
        return 'from-green-500 to-green-600';
      case 'negotiation':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = (type: ConsultationRecord['type']) => {
    switch (type) {
      case 'initial':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"></path>
            <path fillRule="evenodd" d="M2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm8-4a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
          </svg>
        );
      case 'follow-up':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12 8a2 2 0 01-2 2H8a2 2 0 01-2-2v2a2 2 0 01-2-2H2a2 2 0 01-2-2v-2a2 2 0 012-2h12a2 2 0 012 2v2z"></path>
          </svg>
        );
      case 'site-visit':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.905 8.854l-4.905 4.905-2.905-2.905a1 1 0 00-1.414 1.414l3.612 3.612a1 1 0 001.414 0l5.612-5.612a1 1 0 00-1.414-1.414z" clipRule="evenodd"></path>
          </svg>
        );
      case 'negotiation':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v4h8v-4zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  const completed = consultations.filter(c => c.status === 'completed');
  const scheduled = consultations.filter(c => c.status === 'scheduled');
  const cancelled = consultations.filter(c => c.status === 'cancelled');

  const renderConsultationList = (items: ConsultationRecord[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 font-medium">No consultations</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map(consultation => (
          <div key={consultation.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`bg-gradient-to-br ${getTypeColor(consultation.type)} p-3 rounded-lg text-white`}>
                  {getTypeIcon(consultation.type)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 capitalize">
                    {consultation.type.replace('-', ' ')} Consultation
                  </h4>
                  <p className="text-sm text-gray-600">{getClientName(consultation.clientId)}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(consultation.status)}`}>
                {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">{consultation.notes}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {formatDate(consultation.date)}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {consultation.duration} mins
                </span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium transition">View Details</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{completed.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Scheduled</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{scheduled.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Cancelled</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{cancelled.length}</p>
        </div>
      </div>

      {/* Scheduled Consultations */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-blue-600 rounded-full"></span>
          Upcoming Consultations ({scheduled.length})
        </h3>
        {renderConsultationList(scheduled)}
      </div>

      {/* Completed Consultations */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-green-600 rounded-full"></span>
          Completed Consultations ({completed.length})
        </h3>
        {renderConsultationList(completed)}
      </div>

      {/* Cancelled Consultations */}
      {cancelled.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-red-600 rounded-full"></span>
            Cancelled Consultations ({cancelled.length})
          </h3>
          {renderConsultationList(cancelled)}
        </div>
      )}
    </div>
  );
}
