'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '@/app/components/PropertyCard';
import { useConsultingBucket } from '@/app/contexts/ConsultingBucketContext';
import { propertyService } from '@/app/services/propertyService';
import { useAuth } from '@/app/contexts/AuthContext';

export default function SavedPropertiesPage() {
    const { items, removeItem } = useConsultingBucket();
    const { token } = useAuth();
    const [expandedProperty, setExpandedProperty] = useState<string | number | null>(null);
    const [savedProperties, setSavedProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (items.length === 0) {
                setSavedProperties([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // In a real app we'd have a bulk get, but for now we fetch individual
                const details = await Promise.all(
                    items.map(async (item) => {
                        try {
                            const p = await propertyService.getOne(item.id, token || null);
                            return {
                                id: p.id,
                                price: `₹${(Number(p.price) / 100000).toFixed(1)}L`,
                                config: `${p.bedrooms || 2} BHK`,
                                location: p.location,
                                area: `${p.area || 1200} sqft`,
                                age: "New",
                                badge: p.status === 'APPROVED' ? "Verified" : "New Launch",
                                badgeColor: p.status === 'APPROVED' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700",
                                bestFor: p.projectType === 'COMMERCIAL' ? "Investors" : "Families",
                                budgetRange: `₹${(Number(p.price) / 110000).toFixed(0)}L - ₹${(Number(p.price) / 90000).toFixed(0)}L`,
                                reason: "Matches your profile expectations in this high-growth corridor.",
                                highlights: ["Legal Verified", "Modern Amenities", "Prime Location"],
                                consultantNote: "A premium opportunity with excellent connectivity and infrastructure development.",
                                consultant: {
                                    name: "Rajesh Sharma",
                                    initials: "RS",
                                    rating: 4.8,
                                    deals: 35,
                                    role: "Senior Consultant"
                                }
                            };
                        } catch (e) {
                            return null;
                        }
                    })
                );
                setSavedProperties(details.filter(d => d !== null));
            } catch (error) {
                console.error("Failed to fetch saved property details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [items, token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

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
                    <a href="/dashboard/search" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                        Explore properties
                    </a>
                </div>
            ) : (
                <div className="grid gap-6">
                    {savedProperties.map((property) => (
                        <div key={property.id} className="relative group">
                            <PropertyCard
                                property={property}
                                isExpanded={expandedProperty === property.id}
                                onToggleExpand={(id) => setExpandedProperty(id === expandedProperty ? null : id)}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeItem(property.id);
                                }}
                                className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-50"
                                title="Remove from wishlist"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 13H5v-2h14v2z" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
