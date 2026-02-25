'use client';

import { useState } from 'react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  config: string;
  builder: string;
  promotionMaterials: string[];
  assignedToPartners: string[];
}

interface PropertyPromotionsProps {
  properties: Property[];
}

export default function PropertyPromotions({ properties }: PropertyPromotionsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const materialIcons: Record<string, React.ReactNode> = {
    'Brochure': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    'Video Tour': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553 2.276A1 1 0 0120 13.166v3.668a1 1 0 01-1.447.894L15 15.5M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    'Site Photos': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    'Virtual Walkthrough': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    'Drone Footage': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v8h8a10.003 10.003 0 00-2.312-6.022c.033-.04.066-.08.099-.122L12 3v8z" /></svg>,
    'Floor Plans': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    'Premium Brochure': <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-900 text-sm">
          <strong>Promotion Strategy:</strong> Use the provided materials to promote these properties to your network. Share through WhatsApp, Facebook, email, or direct calls to maximize your commissions!
        </p>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600 font-medium">No properties assigned yet</p>
          <p className="text-gray-500 text-sm mt-1">Property Partners will assign properties for you to promote</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {properties.map(property => (
            <div
              key={property.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">{property.title}</h3>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.location}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">CONFIGURATION</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{property.config}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">PRICE</p>
                    <p className="text-sm font-semibold text-blue-600 mt-1">{property.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">BUILDER</p>
                    <p className="text-xs text-gray-700 mt-1 line-clamp-2">{property.builder}</p>
                  </div>
                </div>

                {/* Promotion Materials */}
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-2">PROMOTION MATERIALS</p>
                  <div className="flex flex-wrap gap-2">
                    {property.promotionMaterials.map((material, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {materialIcons[material] || <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} {material}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => setExpandedId(expandedId === property.id ? null : property.id)}
                  className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition text-sm"
                >
                  {expandedId === property.id ? 'Hide' : 'Show'} Promotion Tips
                </button>
              </div>

              {/* Expanded Content */}
              {expandedId === property.id && (
                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        MESSAGING IDEAS
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• "Premium {property.config} at {property.price} in {property.location}. Perfect location & amenities!"</li>
                        <li>• "Just added: Brand new property in {property.location}. Budget-friendly & high returns!"</li>
                        <li>• "Interested buyers? {property.config} with modern design at {property.price}. Check materials below!"</li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        TARGET AUDIENCE
                      </p>
                      <p className="text-xs text-gray-600">People looking for properties in {property.location}, budget {property.price}, configuration {property.config}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        ACTION ITEMS
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-start gap-2">
                          <svg className="w-3 h-3 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Share brochure & photos on social media
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-3 h-3 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Send personalized WhatsApp messages to contacts
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-3 h-3 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Upload property on portals (if permission given)
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-3 h-3 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Coordinate site visits with interested buyers
                        </li>
                      </ul>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-green-700 font-semibold flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Commission Opportunity: Earn 0.5-1% of property value for every successful booking!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
