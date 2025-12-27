interface Client {
  id: string;
  name: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  area: string;
  config: string;
  matchScore: number;
  assignedToClients: string[];
}

interface RecommendedPropertiesSectionProps {
  properties: Property[];
  clients: Client[];
}

export default function RecommendedPropertiesSection({
  properties,
  clients,
}: RecommendedPropertiesSectionProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 90) return 'from-green-400 to-green-600';
    if (score >= 80) return 'from-blue-400 to-blue-600';
    if (score >= 70) return 'from-yellow-400 to-yellow-600';
    return 'from-orange-400 to-orange-600';
  };

  const getClientNames = (clientIds: string[]) => {
    return clientIds
      .map(id => clients.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Properties Summary</h3>
        <p className="text-gray-700">
          You have {properties.length} properties assigned to {clients.length} clients. Below are all available properties with their match scores and assigned clients.
        </p>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12a9 9 0 109 9m0 0l4.35-4.35M12 21v-9m0-9V3m0 0l-4.35 4.35"
            />
          </svg>
          <p className="text-gray-600 font-medium">No properties available</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {properties.map(property => (
            <div
              key={property.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {/* Header with Match Score */}
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className={`bg-gradient-to-br ${getMatchScoreBg(property.matchScore)} rounded-full w-20 h-20 flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                    {property.matchScore}%
                  </div>
                </div>

                <div className="pr-24">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{property.location}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Price and Details */}
                <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Price</p>
                    <p className="text-xl font-bold text-gray-900">{property.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Area</p>
                    <p className="text-lg font-bold text-gray-900">{property.area}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Config</p>
                    <p className="text-lg font-bold text-gray-900">{property.config}</p>
                  </div>
                </div>

                {/* Match Score Details */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Match Quality</span>
                    <span className={`text-sm font-bold ${getMatchScoreColor(property.matchScore)}`}>
                      {property.matchScore >= 90
                        ? 'Excellent'
                        : property.matchScore >= 80
                          ? 'Good'
                          : property.matchScore >= 70
                            ? 'Fair'
                            : 'Moderate'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getMatchScoreBg(property.matchScore)} transition-all`}
                      style={{ width: `${property.matchScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Assigned Clients */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Assigned to {property.assignedToClients.length} Client(s)</p>
                  <div className="space-y-2">
                    {property.assignedToClients.map(clientId => {
                      const client = clients.find(c => c.id === clientId);
                      return client ? (
                        <div
                          key={clientId}
                          className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {client.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{client.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition text-sm">
                    View Details
                  </button>
                  <button className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 font-medium transition text-sm">
                    Manage Clients
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
