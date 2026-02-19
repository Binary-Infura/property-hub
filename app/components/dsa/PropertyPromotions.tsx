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

  const materialIcons: Record<string, string> = {
    'Brochure': '📄',
    'Video Tour': '🎥',
    'Site Photos': '📸',
    'Virtual Walkthrough': '🥽',
    'Drone Footage': '🚁',
    'Floor Plans': '🏗️',
    'Premium Brochure': '📋',
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
                <p className="text-sm text-gray-600 mt-1">📍 {property.location}</p>
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
                        {materialIcons[material] || '📦'} {material}
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
                      <p className="text-xs font-semibold text-gray-700 mb-2">📱 MESSAGING IDEAS</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• "Premium {property.config} at {property.price} in {property.location}. Perfect location & amenities!"</li>
                        <li>• "Just added: Brand new property in {property.location}. Budget-friendly & high returns!"</li>
                        <li>• "Interested buyers? {property.config} with modern design at {property.price}. Check materials below!"</li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">🎯 TARGET AUDIENCE</p>
                      <p className="text-xs text-gray-600">People looking for properties in {property.location}, budget {property.price}, configuration {property.config}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">🚀 ACTION ITEMS</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>✓ Share brochure & photos on social media</li>
                        <li>✓ Send personalized WhatsApp messages to contacts</li>
                        <li>✓ Upload property on portals (if permission given)</li>
                        <li>✓ Coordinate site visits with interested buyers</li>
                      </ul>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-green-700 font-semibold">💡 Commission Opportunity: Earn 0.5-1% of property value for every successful booking!</p>
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
