'use client';

import { useState } from 'react';
import PropertyCard from './PropertyCard';

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
      bestFor: "Growing families seeking top schools and community",
      budgetRange: "₹40L - ₹60L",
      reason: "Matches your budget with excellent school connectivity for families. High appreciation potential in this locality.",
      highlights: ["Family-friendly location", "Top-rated schools nearby", "Good resale value", "Modern amenities"],
      consultantNote: "This property checks all your boxes—budget, location, and family needs. The area has strong appreciation with excellent community infrastructure."
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
      bestFor: "Investors looking for premium rental yields",
      budgetRange: "₹50L - ₹60L",
      reason: "Premium location with strong investment potential. Delivers 4.5% annual rental yield with capital appreciation.",
      highlights: ["4.5% annual rental yield", "Prime investment location", "High demand area", "Strong appreciation"],
      consultantNote: "As an investment property, this shows strong growth trajectory in an upmarket area. Excellent for long-term wealth creation."
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
      bestFor: "Budget-conscious buyers wanting space",
      budgetRange: "₹35L - ₹45L",
      reason: "Spacious layout within budget. Emerging neighborhood with excellent metro connectivity and strong future growth prospects.",
      highlights: ["Best value for space", "Upcoming metro connectivity", "Growth locality", "Modern amenities"],
      consultantNote: "Great value for money. This area is seeing rapid development. You get more space for less, with excellent future appreciation potential."
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
      bestFor: "Large families wanting maximum space and comfort",
      budgetRange: "₹50L - ₹65L",
      reason: "Extra space and room to grow. Thane offers superior land value—get an additional bedroom in your budget.",
      highlights: ["Extra bedroom included", "Better land value", "Growing family-oriented area", "New developments"],
      consultantNote: "If space is a priority, this gives you an extra bedroom compared to other options in your budget range. Ideal for expanding families."
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
      bestFor: "First-time buyers and young couples",
      budgetRange: "₹40L - ₹55L",
      reason: "Perfect starter home with lower maintenance. Quick appreciation expected with excellent community amenities.",
      highlights: ["First-time buyer friendly", "Lower maintenance cost", "Community amenities", "Strong fundamentals"],
      consultantNote: "Perfect starter home. Lower EMI commitment with strong property fundamentals. Great for building wealth over time."
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
