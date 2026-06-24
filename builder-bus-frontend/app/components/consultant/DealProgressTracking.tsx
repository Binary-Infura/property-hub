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

interface Deal {
  id: string;
  clientId: string;
  propertyId: string;
  stage: 'inquiry' | 'site-visit' | 'offer' | 'negotiation' | 'documentation' | 'closed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  notes: string;
}

interface DealProgressTrackingProps {
  deals: Deal[];
  properties: Property[];
  clients: Client[];
}

export default function DealProgressTracking({
  deals,
  properties,
  clients,
}: DealProgressTrackingProps) {
  const formatDate = (date: Date) => {
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

  const getPropertyPrice = (propertyId: string) => {
    return properties.find(p => p.id === propertyId)?.price || '';
  };

  const getStageColor = (stage: Deal['stage']) => {
    switch (stage) {
      case 'inquiry':
        return 'from-gray-500 to-gray-600';
      case 'site-visit':
        return 'from-blue-500 to-blue-600';
      case 'offer':
        return 'from-purple-500 to-purple-600';
      case 'negotiation':
        return 'from-orange-500 to-orange-600';
      case 'documentation':
        return 'from-yellow-500 to-yellow-600';
      case 'closed':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStageLabel = (stage: Deal['stage']) => {
    const labels: Record<Deal['stage'], string> = {
      inquiry: 'Inquiry',
      'site-visit': 'Site Visit',
      offer: 'Offer Made',
      negotiation: 'Negotiation',
      documentation: 'Documentation',
      closed: 'Closed',
    };
    return labels[stage];
  };

  const getStageNumber = (stage: Deal['stage']) => {
    const stages: Record<Deal['stage'], number> = {
      inquiry: 1,
      'site-visit': 2,
      offer: 3,
      negotiation: 4,
      documentation: 5,
      closed: 6,
    };
    return stages[stage];
  };

  const allStages: Deal['stage'][] = ['inquiry', 'site-visit', 'offer', 'negotiation', 'documentation', 'closed'];

  const openDeals = deals.filter(d => d.stage !== 'closed');
  const closedDeals = deals.filter(d => d.stage === 'closed');

  const renderDealTimeline = (deal: Deal) => {
    const currentStageNumber = getStageNumber(deal.stage);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{deal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
            style={{ width: `${deal.progress}%` }}
          ></div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          {allStages.map((stage, index) => {
            const stageNum = getStageNumber(stage);
            const isActive = stageNum <= currentStageNumber;
            const isCurrent = stageNum === currentStageNumber;

            return (
              <div key={stage} className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full font-bold text-white flex items-center justify-center text-sm transition ${isActive ? `bg-gradient-to-br ${getStageColor(stage)}` : 'bg-gray-300'
                    } ${isCurrent ? 'ring-4 ring-blue-200 shadow-lg' : ''}`}
                >
                  {isCurrent ? (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {getStageLabel(stage)}
                  </p>
                  {isCurrent && <p className="text-xs text-blue-600 font-medium">Current stage</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Open Deals</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{openDeals.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Closed Deals</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{closedDeals.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Total Deals</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{deals.length}</p>
        </div>
      </div>

      {/* Open Deals */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-blue-600 rounded-full"></span>
          Open Deals ({openDeals.length})
        </h3>

        {openDeals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-600 font-medium">No open deals at the moment</p>
          </div>
        ) : (
          <div className="space-y-6">
            {openDeals.map(deal => (
              <div key={deal.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{getPropertyTitle(deal.propertyId)}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <span>Client: {getClientName(deal.clientId)}</span>
                        <span>•</span>
                        <span>{getPropertyPrice(deal.propertyId)}</span>
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full font-semibold text-white text-sm bg-gradient-to-r ${getStageColor(
                        deal.stage
                      )}`}
                    >
                      {getStageLabel(deal.stage)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 grid md:grid-cols-3 gap-6">
                  {/* Timeline */}
                  <div className="md:col-span-2">{renderDealTimeline(deal)}</div>

                  {/* Details */}
                  <div className="border-l border-gray-200 pl-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Created</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(deal.createdAt)}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Last Updated</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(deal.updatedAt)}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Days in Progress</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {Math.floor((new Date().getTime() - deal.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>

                      <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition text-sm">
                        Update Deal
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {deal.notes && (
                  <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Deal Notes</p>
                    <p className="text-sm text-gray-700">{deal.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closed Deals */}
      {closedDeals.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-green-600 rounded-full"></span>
            Closed Deals ({closedDeals.length})
          </h3>

          <div className="space-y-4">
            {closedDeals.map(deal => (
              <div key={deal.id} className="bg-white border border-green-200 rounded-lg p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{getPropertyTitle(deal.propertyId)}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <span>Client: {getClientName(deal.clientId)}</span>
                      <span>•</span>
                      <span>{getPropertyPrice(deal.propertyId)}</span>
                    </p>
                  </div>
                  <div className="px-4 py-2 rounded-full font-semibold text-white text-sm bg-gradient-to-r from-green-500 to-green-600">
                    Closed
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Started</p>
                    <p className="font-semibold text-gray-900">{formatDate(deal.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Closed</p>
                    <p className="font-semibold text-gray-900">{formatDate(deal.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {Math.floor((deal.updatedAt.getTime() - deal.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium transition self-end">
                    View Summary
                  </button>
                </div>

                {deal.notes && (
                  <div className="mt-4 bg-green-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Closing Notes</p>
                    <p className="text-sm text-gray-700">{deal.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
