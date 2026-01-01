import { Lead } from '@/app/types/lead';

interface LeadCardProps {
  lead: Lead;
  onViewDetails?: (lead: Lead) => void;
  onSelect?: (leadId: string) => void;
  isSelected?: boolean;
}

export default function LeadCard({
  lead,
  onViewDetails,
  onSelect,
  isSelected = false,
}: LeadCardProps) {
  const getQualityColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified':
        return 'bg-green-100 text-green-700';
      case 'pending-review':
        return 'bg-yellow-100 text-yellow-700';
      case 'spam':
        return 'bg-red-100 text-red-700';
      case 'assigned':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statusLabels: Record<string, string> = {
    'qualified': 'Qualified',
    'pending-review': 'Pending Review',
    'spam': 'Spam',
    'assigned': 'Assigned',
    'new': 'New Lead',
  };

  return (
    <div
      onClick={() => onSelect?.(lead.id)}
      className={`bg-white rounded-lg border transition cursor-pointer ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect?.(lead.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>
            <p className="text-sm text-gray-600">{lead.phone}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(lead.status)}`}>
            {statusLabels[lead.status] || lead.status}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Location</p>
            <p className="text-gray-900">{lead.location}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Budget</p>
            <p className="text-gray-900">{lead.budget}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Property Type</p>
            <p className="text-gray-900">{lead.propertyType}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Intent</p>
            <p className="text-gray-900 capitalize">{lead.buyerIntent}</p>
          </div>
        </div>

        {/* Tags Section */}
        {(lead.region || lead.city || lead.source) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {lead.region && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                Region: {lead.region}
              </span>
            )}
            {lead.city && (
              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                City: {lead.city}
              </span>
            )}
            {lead.source && (
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                {lead.source}
              </span>
            )}
          </div>
        )}

        {/* Quality Score and Metadata */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-600 font-medium">Quality Score</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`px-2 py-1 rounded text-sm font-semibold ${getQualityColor(lead.qualityScore)}`}>
                  {lead.qualityScore}%
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Received</p>
              <p className="text-sm text-gray-900 font-medium">
                {new Date(lead.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(lead);
            }}
            className="px-3 py-2 bg-blue-50 text-blue-700 rounded font-medium text-sm hover:bg-blue-100 transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
