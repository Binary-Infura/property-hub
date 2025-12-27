'use client';

interface PropertyForComparison {
  id: number;
  title: string;
  price: string;
  location: string;
  area: string;
  config: string;
  propertyType: string;
  bhk: string;
  amenities: string[];
  highlights: string[];
  legalVerified: boolean;
}

interface PropertyComparisonProps {
  properties: PropertyForComparison[];
  onClose: () => void;
  onRemove: (id: number) => void;
}

export default function PropertyComparison({ properties, onClose, onRemove }: PropertyComparisonProps) {
  if (properties.length === 0) return null;

  const allAmenities = Array.from(new Set(properties.flatMap(p => p.amenities)));
  const allHighlights = Array.from(new Set(properties.flatMap(p => p.highlights)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Compare Properties</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            {/* Properties Header */}
            <div className="grid" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
              <div className="sticky left-0 z-10 bg-white border-r border-gray-200"></div>
              {properties.map((property) => (
                <div key={property.id} className="border-b border-gray-200 p-4 bg-gray-50">
                  <div className="relative">
                    <button
                      onClick={() => onRemove(property.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                    <h3 className="font-bold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-sm text-gray-600">{property.location}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
              <div className="sticky left-0 z-10 bg-white border-r border-gray-200 p-4 font-semibold text-gray-700">
                Price
              </div>
              {properties.map((property) => (
                <div key={property.id} className="p-4">
                  <p className="text-xl font-bold text-blue-600">{property.price}</p>
                </div>
              ))}
            </div>

            {/* Area */}
            <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
              <div className="sticky left-0 z-10 bg-white border-r border-gray-200 p-4 font-semibold text-gray-700">
                Area
              </div>
              {properties.map((property) => (
                <div key={property.id} className="p-4">
                  <p className="text-gray-900">{property.area}</p>
                </div>
              ))}
            </div>

            {/* Configuration */}
            <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
              <div className="sticky left-0 z-10 bg-white border-r border-gray-200 p-4 font-semibold text-gray-700">
                Configuration
              </div>
              {properties.map((property) => (
                <div key={property.id} className="p-4">
                  <p className="text-gray-900">{property.config} • {property.bhk}</p>
                </div>
              ))}
            </div>

            {/* Property Type */}
            <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
              <div className="sticky left-0 z-10 bg-white border-r border-gray-200 p-4 font-semibold text-gray-700">
                Property Type
              </div>
              {properties.map((property) => (
                <div key={property.id} className="p-4">
                  <p className="text-gray-900">{property.propertyType}</p>
                </div>
              ))}
            </div>

            {/* Legal Verification */}
            <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
              <div className="sticky left-0 z-10 bg-white border-r border-gray-200 p-4 font-semibold text-gray-700">
                Legal Status
              </div>
              {properties.map((property) => (
                <div key={property.id} className="p-4">
                  {property.legalVerified ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
              <div className="sticky left-0 z-10 bg-white border-r border-gray-200 p-4 font-semibold text-gray-700">
                Key Highlights
              </div>
              {properties.map((property) => (
                <div key={property.id} className="p-4">
                  <ul className="space-y-1">
                    {property.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Amenities */}
            {allAmenities.length > 0 && (
              <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
                <div className="sticky left-0 z-10 bg-white border-r border-gray-200 p-4 font-semibold text-gray-700">
                  Amenities
                </div>
                {properties.map((property) => (
                  <div key={property.id} className="p-4">
                    <ul className="space-y-1">
                      {property.amenities.map((amenity, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            Shortlist Selected
          </button>
        </div>
      </div>
    </div>
  );
}

