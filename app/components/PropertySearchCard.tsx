'use client';

interface PropertySearchCardData {
  id: number;
  title: string;
  config: string;
  location: string;
  area: string;
  price: string;
  propertyType: 'Flat' | 'Villa' | 'Plot' | 'Commercial';
  bhk: string;
  isNew: boolean;
  isReadyToMove: boolean;
  highlights: string[];
  legalVerified: boolean;
  recommendationTag?: 'Perfect Match' | 'Budget Friendly' | 'Best Investment';
  recommendationReason?: string;
  image?: string;
}

interface PropertySearchCardProps {
  property: PropertySearchCardData;
  isShortlisted: boolean;
  isSelectedForCompare: boolean;
  onShortlist: (id: number) => void;
  onViewDetails: (id: number) => void;
  onToggleCompare: (id: number) => void;
}

export default function PropertySearchCard({
  property,
  isShortlisted,
  isSelectedForCompare,
  onShortlist,
  onViewDetails,
  onToggleCompare,
}: PropertySearchCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden transition-all ${
      isSelectedForCompare ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
    }`}>
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
        {property.image ? (
          <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.recommendationTag && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              property.recommendationTag === 'Perfect Match'
                ? 'bg-green-500 text-white'
                : property.recommendationTag === 'Budget Friendly'
                ? 'bg-amber-500 text-white'
                : 'bg-blue-500 text-white'
            }`}>
              {property.recommendationTag}
            </span>
          )}
          {property.legalVerified && (
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Legal Verified
            </span>
          )}
        </div>

        {/* Compare Checkbox */}
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(property.id);
            }}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
              isSelectedForCompare
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-400 hover:border-blue-500'
            }`}
          >
            {isSelectedForCompare && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title & Location */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{property.title}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.location}
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-blue-600">{property.price}</p>
          <p className="text-xs text-gray-500 mt-1">{property.config} • {property.area}</p>
        </div>

        {/* Property Details */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {property.propertyType}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {property.bhk}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {property.isNew ? 'New' : 'Resale'}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {property.isReadyToMove ? 'Ready to Move' : 'Under Construction'}
          </span>
        </div>

        {/* Key Highlights */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Key Highlights</p>
          <div className="space-y-1">
            {property.highlights.slice(0, 3).map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                <span className="text-sm text-gray-700">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation Reason */}
        {property.recommendationReason && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Why This Property</p>
            <p className="text-sm text-gray-700">{property.recommendationReason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(property.id)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition"
          >
            View Details
          </button>
          <button
            onClick={() => onShortlist(property.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              isShortlisted
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isShortlisted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

