'use client';

interface PropertyDraft {
  id: string;
  title: string;
  config: string;
  location: string;
  price: string;
  area: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: Date;
  submittedAt?: Date;
  feedback?: string;
}

interface PropertyDraftsListProps {
  properties: PropertyDraft[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSubmit: (id: string) => void;
  isDraft: boolean;
}

export default function PropertyDraftsList({
  properties,
  onEdit,
  onDelete,
  onSubmit,
  isDraft,
}: PropertyDraftsListProps) {
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
      submitted: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Under Review' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
    };
    const badge = badges[status] || badges.draft;
    return badge;
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-12 h-12 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-600 font-medium">No properties yet</p>
        <p className="text-gray-500 text-sm mt-1">
          {isDraft ? 'Create your first property draft' : 'No submitted properties'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => {
        const badge = getStatusBadge(property.status);
        return (
          <div
            key={property.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Property Info */}
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{property.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {property.config} • {property.location}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span className="font-medium">{property.price}</span>
                      <span>•</span>
                      <span>{property.area} sqft</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex flex-col gap-3 items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>

                {property.status === 'rejected' && property.feedback && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 max-w-xs text-right">
                    <p className="text-xs font-semibold text-red-700 mb-1">Feedback:</p>
                    <p className="text-sm text-red-600">{property.feedback}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {isDraft && (
                    <>
                      <button
                        onClick={() => onEdit(property.id)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onSubmit(property.id)}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Submit for Approval
                      </button>
                    </>
                  )}

                  {!isDraft && property.status !== 'approved' && (
                    <button
                      onClick={() => onEdit(property.id)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => onDelete(property.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  {property.status === 'draft'
                    ? `Created ${new Date(property.createdAt).toLocaleDateString()}`
                    : `Submitted ${property.submittedAt ? new Date(property.submittedAt).toLocaleDateString() : ''}`}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
