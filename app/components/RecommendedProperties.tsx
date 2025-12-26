'use client';

import { useState } from 'react';

export default function RecommendedProperties() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  const recommendedProperties = [
    {
      id: 1,
      price: "₹45L",
      config: "3 BHK",
      location: "Andheri, Mumbai",
      area: "1500 sqft",
      age: "5-year old",
      badge: "Perfect Match",
      badgeColor: "bg-green-100 text-green-700",
      reason: "Matches your ₹40-60L budget with excellent school connectivity for families. High appreciation potential in this locality.",
      highlights: ["Family-friendly location", "Good resale value", "Modern amenities"],
      consultantNote: "This property checks all your boxes—budget, location, and family needs."
    },
    {
      id: 2,
      price: "₹52L",
      config: "2 BHK",
      location: "Bandra, Mumbai",
      area: "1200 sqft",
      age: "3-year old",
      badge: "High Demand",
      badgeColor: "bg-blue-100 text-blue-700",
      reason: "Premium location with investment potential. Strong rental yield of 4.5% annually. Strategic for investors.",
      highlights: ["High rental yield", "Prime location", "Investment-grade"],
      consultantNote: "As an investment property, this shows strong growth trajectory in an upmarket area."
    },
    {
      id: 3,
      price: "₹38L",
      config: "3 BHK",
      location: "Powai, Mumbai",
      area: "1400 sqft",
      age: "7-year old",
      badge: "Value Deal",
      badgeColor: "bg-amber-100 text-amber-700",
      reason: "Within budget with spacious layout. Emerging neighborhood with excellent connectivity and future growth prospects.",
      highlights: ["Within budget", "Spacious living", "Growth locality"],
      consultantNote: "Great value for money. This area is seeing rapid development with new metro connectivity."
    },
    {
      id: 4,
      price: "₹55L",
      config: "4 BHK",
      location: "Thane, Mumbai",
      area: "1800 sqft",
      age: "2-year old",
      badge: "Spacious",
      badgeColor: "bg-purple-100 text-purple-700",
      reason: "Extra space for the same budget. Thane offers better land value and is ideal for growing families looking for room to expand.",
      highlights: ["Extra space", "Better value", "Family-oriented"],
      consultantNote: "If space is a priority, this gives you an extra bedroom compared to other options in your budget."
    },
    {
      id: 5,
      price: "₹48L",
      config: "2 BHK",
      location: "Malad, Mumbai",
      area: "1100 sqft",
      age: "4-year old",
      badge: "Compact Smart",
      badgeColor: "bg-rose-100 text-rose-700",
      reason: "Ideal for first-time buyers. Lower maintenance, quick appreciation, and excellent community amenities nearby.",
      highlights: ["First-time buyer friendly", "Easy maintenance", "Community amenities"],
      consultantNote: "Perfect starter home. Lower EMI commitment with strong property fundamentals."
    }
  ];

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
            <div
              key={property.id}
              onClick={() => setSelectedProperty(selectedProperty === property.id ? null : property.id)}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition cursor-pointer group"
            >
              {/* Property Image */}
              <div className="h-56 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <svg className="w-24 h-24 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                <span className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold ${property.badgeColor}`}>
                  {property.badge}
                </span>
              </div>

              {/* Property Details */}
              <div className="p-6">
                {/* Price and Config */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{property.price}</p>
                    <p className="text-gray-600 font-medium">{property.config}, {property.location}</p>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {property.area}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a1 1 0 001 1h12a1 1 0 001-1V6a2 2 0 00-2-2H4zm0 6a1 1 0 001 1h6a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1z" clipRule="evenodd"/>
                    </svg>
                    {property.age}
                  </span>
                </div>

                {/* Reason Section */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Why we recommend this:</p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {property.reason}
                  </p>
                </div>

                {/* Highlights */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="space-y-2">
                    {property.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm text-gray-700 font-medium">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expandable Consultant Note */}
                {selectedProperty === property.id && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-in">
                    <p className="text-sm font-semibold text-green-900 mb-2">💬 Consultant's Note:</p>
                    <p className="text-sm text-green-800">{property.consultantNote}</p>
                  </div>
                )}

                {/* CTA Button */}
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition">
                  Schedule Site Visit
                </button>

                {/* Expand Hint */}
                <p className="text-center text-xs text-gray-400 mt-3">
                  Click to see consultant's note
                </p>
              </div>
            </div>
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
