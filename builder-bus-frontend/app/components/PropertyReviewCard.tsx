'use client';

interface InternalNote {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

interface PropertySubmission {
  id: string;
  title: string;
  config: string;
  location: string;
  price: string;
  area: string;
  builderName: string;
  status: 'submitted' | 'approved' | 'rejected' | 'live';
  submittedAt: Date;
  internalNotes: InternalNote[];
  rejectionReason?: string;
}

interface PropertyReviewCardProps {
  property: PropertySubmission;
  onViewDetails: () => void;
}

export default function PropertyReviewCard({ property, onViewDetails }: PropertyReviewCardProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; label: string }> = {
      submitted: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending Review' },
      approved: { bg: 'bg-green-50', text: 'text-green-700', label: 'Approved' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' },
      live: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Live' },
    };
    return colors[status] || colors.submitted;
  };

  const statusColor = getStatusColor(property.status);
  const daysAgo = Math.floor((Date.now() - property.submittedAt.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`rounded-lg border-2 p-5 transition hover:shadow-md ${statusColor.bg}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Property Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{property.title}</h3>
              <p className="text-gray-600 text-sm mt-1">
                {property.config} • {property.location}
              </p>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span className="font-semibold">{property.price}</span>
                <span>•</span>
                <span>{property.area}</span>
              </div>
              <div className="flex gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor.text}`}>
                  {statusColor.label}
                </span>
                <span className="text-xs text-gray-500">
                  {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`} • By {property.builderName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes and Action */}
        <div className="flex flex-col items-end gap-3">
          {property.internalNotes.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
              </svg>
              <span className="text-gray-600">{property.internalNotes.length} notes</span>
            </div>
          )}

          {property.rejectionReason && (
            <div className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded max-w-xs text-right">
              Reason: {property.rejectionReason.substring(0, 50)}...
            </div>
          )}

          <button
            onClick={onViewDetails}
            className="bg-white text-gray-900 border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 font-medium text-sm transition"
          >
            Review Details
          </button>
        </div>
      </div>
    </div>
  );
}
