'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Society } from '@/app/types/society';

// Mock data - replace with actual API calls
const MOCK_SOCIETIES: Society[] = [
    {
        id: 'society-001',
        name: 'Sunset Heights Society',
        projectId: 'prop_1767858213328',
        projectName: 'Sunset Towers',
        address: '123 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        totalTowers: 3,
        totalUnits: 240,
        towers: [],
        amenities: [],
        possessionStatus: 'handed-over',
        handoverStatus: 'builder-managed',
        roles: [],
        members: [],
        services: { maintenance: true, security: true, facilityManagement: false },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        createdBy: 'builder@example.com',
        isLocked: false,
    },
    {
        id: 'society-002',
        name: 'Green Valley Residents',
        projectName: 'Green Valley Residency',
        address: '45 Powai Lake Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400076',
        totalTowers: 5,
        totalUnits: 400,
        towers: [],
        amenities: [],
        possessionStatus: 'ready',
        handoverStatus: 'transitioning',
        expectedHandoverDate: new Date('2024-06-30'),
        roles: [],
        members: [],
        services: { maintenance: true, security: true, facilityManagement: true },
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        createdBy: 'builder@example.com',
        isLocked: false,
    },
];

const HANDOVER_STATUS_CONFIG = {
    'builder-managed': { label: 'Property Partner Managed', color: 'bg-blue-100 text-blue-800' },
    'transitioning': { label: 'Transitioning to RWA', color: 'bg-amber-100 text-amber-800' },
    'fully-handed-over': { label: 'Handed Over', color: 'bg-green-100 text-green-800' },
};

const POSSESSION_STATUS_CONFIG = {
    'under-construction': { label: 'Under Construction', color: 'bg-orange-100 text-orange-800' },
    'ready': { label: 'Ready for Possession', color: 'bg-purple-100 text-purple-800' },
    'handed-over': { label: 'Possession Given', color: 'bg-green-100 text-green-800' },
};

export default function SocietyListingPage() {
    const [societies] = useState<Society[]>(MOCK_SOCIETIES);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSocieties = societies.filter(society =>
        society.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        society.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        society.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Link href="/property-partner/dashboard" className="hover:text-gray-900">
                                    Dashboard
                                </Link>
                                <span>→</span>
                                <span className="text-gray-900 font-medium">Societies</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Societies</h1>
                            <p className="text-gray-600 mt-1">Manage post-handover societies for your projects</p>
                        </div>
                        <Link
                            href="/property-partner/society/create"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Society
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Societies</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{societies.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Property Partner Managed</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    {societies.filter(s => s.handoverStatus === 'builder-managed').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Units</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {societies.reduce((sum, s) => sum + s.totalUnits, 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Members</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">
                                    {societies.reduce((sum, s) => sum + s.members.length, 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="relative max-w-md">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search societies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Societies Grid */}
                {filteredSocieties.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSocieties.map((society) => {
                            const handoverConfig = HANDOVER_STATUS_CONFIG[society.handoverStatus];
                            const possessionConfig = POSSESSION_STATUS_CONFIG[society.possessionStatus];

                            return (
                                <div
                                    key={society.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-300 transition-all overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600 relative p-4">
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-lg font-bold text-white truncate">{society.name}</h3>
                                            <p className="text-indigo-100 text-sm truncate">{society.projectName}</p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-4">
                                        {/* Status Badges */}
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${handoverConfig.color}`}>
                                                {handoverConfig.label}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${possessionConfig.color}`}>
                                                {possessionConfig.label}
                                            </span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{society.city}, {society.state}</span>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                <p className="text-xl font-bold text-gray-900">{society.totalTowers}</p>
                                                <p className="text-xs text-gray-600">Towers</p>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                <p className="text-xl font-bold text-gray-900">{society.totalUnits}</p>
                                                <p className="text-xs text-gray-600">Units</p>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                <p className="text-xl font-bold text-gray-900">{society.members.length}</p>
                                                <p className="text-xs text-gray-600">Members</p>
                                            </div>
                                        </div>

                                        {/* Services */}
                                        <div className="flex gap-2">
                                            {society.services.maintenance && (
                                                <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">Maintenance</span>
                                            )}
                                            {society.services.security && (
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">Security</span>
                                            )}
                                            {society.services.facilityManagement && (
                                                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">Facilities</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            Created {new Date(society.createdAt).toLocaleDateString('en-IN')}
                                        </span>
                                        <Link
                                            href={`/property-partner/society/${society.id}/dashboard`}
                                            className="text-blue-600 font-semibold text-sm hover:text-blue-700"
                                        >
                                            Manage →
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
                        <svg
                            className="w-16 h-16 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-gray-600 font-medium mb-1">No societies found</p>
                        <p className="text-gray-500 text-sm mb-4">Create your first society to manage post-handover operations</p>
                        <Link
                            href="/property-partner/society/create"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Society
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
