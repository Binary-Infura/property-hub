'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property, PropertyStatus } from '@/app/types/property';
import { PROPERTY_STATUS_CONFIG } from '@/app/constants/property';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import SelectPropertyModal from '@/app/components/property-partner/SelectPropertyModal';
import ViewListingModal from '@/app/components/property-partner/ViewListingModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type FilterStatus = PropertyStatus | 'all';

export default function PublicListingPage() {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const regionCode = activeContext.activeRegion.code;

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchQuery, setSearchQuery] = useState('');

    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [selectedPropertyForView, setSelectedPropertyForView] = useState<Property | null>(null);
    const [isViewListingModalOpen, setIsViewListingModalOpen] = useState(false);

    const fetchProperties = async () => {
        if (!token || !regionCode) return;

        try {
            setLoading(true);
            // Fetch "my" properties
            const res = await fetch(`${API_URL}/api/${regionCode}/properties?myOnly=true`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                const mapped: Property[] = data.map((p: any) => {
                    let description = p.description || '';
                    let amenities: string[] = [];
                    if (description.includes('Amenities:')) {
                        const parts = description.split('Amenities:');
                        description = parts[0].trim();
                        amenities = parts[1].split(',').map((a: string) => a.trim());
                    }

                    return {
                        id: p.id,
                        title: p.name,
                        propertyType: p.propertyType === 'COMMERCIAL' ? 'commercial' : 'residential',
                        location: p.location,
                        address: p.address || '',
                        city: p.locationRel?.city || p.city || '',
                        state: p.locationRel?.state || p.state || '',
                        pincode: p.pincode || '',
                        totalArea: parseFloat(p.area) || 0,
                        totalBuildings: 0,
                        totalUnits: 0,
                        startingPrice: parseFloat(p.price) || 0,
                        description: description,
                        amenities: amenities,
                        status: p.status.toLowerCase() as PropertyStatus,
                        createdAt: new Date(p.createdAt),
                        videoUrl: p.videoUrl || '',
                        continent: p.locationRel?.continent || p.continent || '',
                        country: p.locationRel?.country || p.country || '',
                    };
                });
                setProperties(mapped);
            } else {
                console.error('Failed to fetch properties');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [token, regionCode]);

    const statusCounts = {
        submitted: properties.filter(p => p.status === 'submitted').length,
        approved: properties.filter(p => p.status === 'approved').length,
        rejected: properties.filter(p => p.status === 'rejected').length,
        published: properties.filter(p => p.status === 'published').length,
    };

    const filteredProperties = properties.filter(prop => {
        // Only show Submitted, Approved, Rejected on this page
        const allowedStatuses = ['submitted', 'approved', 'rejected', 'published'];
        if (!allowedStatuses.includes(prop.status)) return false;

        const statusMatch = filterStatus === 'all' || prop.status === filterStatus;
        const searchMatch = prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prop.location.toLowerCase().includes(searchQuery.toLowerCase());
        return statusMatch && searchMatch;
    });

    if (loading && properties.length === 0) {
        return <div className="p-8 text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Loading listings...
        </div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Public Listings</h1>
                    <p className="text-gray-600 mt-1">Manage your Submitted and Published properties</p>
                </div>
                <button
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black font-bold transition flex items-center gap-2 shadow-lg"
                    onClick={() => setIsSelectModalOpen(true)}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Listing
                </button>
            </div>

            <SelectPropertyModal
                isOpen={isSelectModalOpen}
                onClose={() => setIsSelectModalOpen(false)}
                onSuccess={fetchProperties}
            />

            <ViewListingModal
                isOpen={isViewListingModalOpen}
                onClose={() => {
                    setIsViewListingModalOpen(false);
                    setSelectedPropertyForView(null);
                }}
                property={selectedPropertyForView}
            />

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <p className="text-gray-600 text-sm font-medium">Submitted</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{statusCounts.submitted}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <p className="text-gray-600 text-sm font-medium">Approved</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{statusCounts.approved}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <p className="text-gray-600 text-sm font-medium">Rejected</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">{statusCounts.rejected}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                    <p className="text-gray-600 text-sm font-medium">Total Listings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{statusCounts.submitted + statusCounts.approved + statusCounts.rejected}</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    <div className="flex-1 w-full">
                        <input
                            type="text"
                            placeholder="Search listings..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterStatus('submitted')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === 'submitted'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Submitted ({statusCounts.submitted})
                        </button>
                        <button
                            onClick={() => setFilterStatus('approved')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Approved ({statusCounts.approved})
                        </button>
                        <button
                            onClick={() => setFilterStatus('rejected')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Rejected ({statusCounts.rejected})
                        </button>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition ${viewMode === 'list'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition ${viewMode === 'grid'
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM14 5a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V5zM4 15a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 15a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* List/Grid View */}
            {filteredProperties.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium mb-2">No listings found</p>
                    <p className="text-gray-400 mb-4">
                        {searchQuery ? 'Adjust your search to see results.' : 'Submit a property from your drafts to see it here.'}
                    </p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProperties.map(property => {
                                const statusConfig = PROPERTY_STATUS_CONFIG[property.status];
                                return (
                                    <tr key={property.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{property.title}</p>
                                            <p className="text-sm text-gray-500">₹{(property.startingPrice / 100000).toFixed(1)}L+</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 text-sm">{property.location}</td>
                                        <td className="px-6 py-4 text-gray-700 text-sm capitalize">{property.propertyType}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig?.bgColor || 'bg-gray-100'} ${statusConfig?.color || 'text-gray-600'}`}>
                                                {statusConfig?.label || property.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPropertyForView(property);
                                                        setIsViewListingModalOpen(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-700 font-semibold text-xs bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 transition"
                                                >
                                                    Listing
                                                </button>
                                                <Link
                                                    href={`/property-partner/dashboard/properties/${property.id}`}
                                                    className="text-gray-600 hover:text-gray-900 font-semibold text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 transition"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map(property => {
                        const statusConfig = PROPERTY_STATUS_CONFIG[property.status];
                        return (
                            <div key={property.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                {/* Video or Placeholder */}
                                {property.videoUrl ? (
                                    <div className="relative aspect-video bg-black">
                                        <video
                                            className="w-full h-full object-cover"
                                            controls
                                            preload="metadata"
                                        >
                                            <source src={property.videoUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                ) : (
                                    <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                                        <span className="text-5xl">🏠</span>
                                    </div>
                                )}

                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 truncate mb-1">{property.title}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{property.location}</p>
                                    <p className="text-lg font-bold text-blue-600 mb-3">₹{(property.startingPrice / 100000).toFixed(1)}L+</p>
                                    <div className="flex justify-between items-center">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusConfig?.bgColor} ${statusConfig?.color}`}>
                                            {statusConfig?.label}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedPropertyForView(property);
                                                    setIsViewListingModalOpen(true);
                                                }}
                                                className="text-blue-600 text-xs font-bold hover:underline"
                                            >
                                                Listing Data
                                            </button>
                                            <Link href={`/property-partner/dashboard/properties/${property.id}`} className="text-gray-600 text-xs font-bold hover:underline">View</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
