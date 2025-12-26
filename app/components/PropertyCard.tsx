import { useState } from 'react';

interface PropertyData {
  id: number;
  config: string;
  location: string;
  area: string;
  age: string;
  price: string;
  budgetRange: string;
  bestFor: string;
  reason: string;
  highlights: string[];
  consultantNote: string;
  badge: string;
  badgeColor: string;
}

interface PropertyCardProps {
  property: PropertyData;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
}

export default function PropertyCard({ property, isExpanded, onToggleExpand }: PropertyCardProps) {
  return (
    <div
      onClick={() => onToggleExpand(property.id)}
      className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group"
    >
      {/* Header with Badge */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{property.config}</h3>
            <p className="text-gray-600 text-sm mt-1">{property.location}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${property.badgeColor}`}>
            {property.badge}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Best For - Prominent Section */}
        <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Best For</p>
          <p className="text-gray-900 font-semibold text-lg leading-snug">
            {property.bestFor}
          </p>
        </div>

        {/* Why We Recommend */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Why We Recommend This</p>
          <p className="text-gray-700 leading-relaxed text-sm">
            {property.reason}
          </p>
        </div>

        {/* Budget & Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Budget Range</p>
            <p className="text-lg font-bold text-gray-900">{property.budgetRange}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Asking Price</p>
            <p className="text-lg font-bold text-blue-600">{property.price}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Area</p>
            <p className="text-sm font-semibold text-gray-900">{property.area}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Property Age</p>
            <p className="text-sm font-semibold text-gray-900">{property.age}</p>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Key Highlights</p>
          <div className="space-y-2">
            {property.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                <span className="text-gray-700 text-sm font-medium">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable Consultant Note */}
        {isExpanded && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg animate-in">
            <p className="text-xs font-semibold text-green-900 uppercase tracking-wider mb-2">💬 Consultant's Insight</p>
            <p className="text-gray-800 text-sm leading-relaxed">
              {property.consultantNote}
            </p>
          </div>
        )}

        {/* Location Details Summary */}
        <div className="mb-5 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider mb-2">📍 Location</p>
          <p className="text-gray-900 font-medium text-sm">{property.location}</p>
          <p className="text-gray-600 text-xs mt-1">
            Click to see consultant's insights about this property
          </p>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition shadow-sm hover:shadow-md">
          Schedule Site Visit
        </button>
      </div>

      {/* Footer Hint */}
      <div className="px-6 py-3 bg-gray-50 text-center border-t border-gray-100">
        <p className="text-xs text-gray-500">
          {isExpanded ? '✓ Consultant note visible' : 'Click card to see consultant insight'}
        </p>
      </div>
    </div>
  );
}
