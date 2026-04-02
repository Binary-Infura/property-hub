'use client';

import { useState } from 'react';
import PropertyCard from './PropertyCard';

export default function RecommendedProperties({ properties = [] } : { properties?: any[] }) {
  const [selectedProperty, setSelectedProperty] = useState<number | string | null>(null);

  const recommendedProperties = properties;

  return (
    <section id="recommended" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              Based on Your Profile
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Recommended for You
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our consultants have hand-picked these properties specifically matching your budget, location, and buying intent. Each recommendation includes a personalized explanation.
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isExpanded={selectedProperty === property.id}
              onToggleExpand={(id) => setSelectedProperty(selectedProperty === id ? null : id)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-10 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Want to See More Recommendations?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Connect with your dedicated consultant to get an expanded list of curated properties tailored to your specific requirements.
          </p>
          <button className="bg-blue-600 text-white px-10 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg transition">
            Talk to Your Consultant
          </button>
        </div>
      </div>
    </section>
  );
}
