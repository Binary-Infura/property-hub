'use client';

import { useState } from 'react';
import PropertyCard from '@/app/components/PropertyCard';

// Sample data - in a real app, this would come from an API
const savedProperties = [
    {
        id: 1,
        price: "₹85L",
        config: "3 BHK",
        location: "Bandra, Mumbai",
        area: "1800 sqft",
        age: "2-year old",
        badge: "Price Dropped",
        badgeColor: "bg-red-100 text-red-700",
        bestFor: "Premium living with sea view",
        budgetRange: "₹80L - ₹1Cr",
        reason: "High demand property in a prime location. Recently reduced price makes it a steal.",
        highlights: ["Sea view", "Prime location", "Modern amenities", "Ready to move"],
        consultantNote: "Excellent investment opportunity. Bandra properties rarely see price drops like this."
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
        reason: "Spacious layout within budget. Emerging neighborhood with excellent metro connectivity.",
        highlights: ["Best value for space", "Upcoming metro", "Growth locality", "Modern amenities"],
        consultantNote: "Great value for money. This area is seeing rapid development."
    }
];

export default function SavedPropertiesPage() {
    const [expandedProperty, setExpandedProperty] = useState<number | null>(null);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
                    <p className="text-gray-500 mt-1">Found something you like? Keep track of your favorites here.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold border border-blue-100">
                    {savedProperties.length} Properties
                </div>
            </div>

            {savedProperties.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No saved properties</h2>
                    <p className="text-gray-500 mb-6">Explore our curated recommendations to find your dream home.</p>
                    <a href="/dashboard" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                        Back to Dashboard
                    </a>
                </div>
            ) : (
                <div className="grid gap-6">
                    {savedProperties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            isExpanded={expandedProperty === property.id}
                            onToggleExpand={(id) => setExpandedProperty(id === expandedProperty ? null : id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
