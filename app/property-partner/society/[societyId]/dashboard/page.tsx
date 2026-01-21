'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Society, HandoverStatus } from '@/app/types/society';

// Mock data - replace with actual API call
const getMockSociety = (societyId: string): Society => ({
    id: societyId,
    name: 'Sunset Heights Society',
    projectId: 'prop_1767858213328',
    projectName: 'Sunset Towers',
    address: '123 Marine Drive',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    totalTowers: 3,
    totalUnits: 240,
    towers: [
        { id: 't1', name: 'Tower A', totalFloors: 20, floorStart: 1, unitsPerFloor: 4, flatNumberingPattern: '101-104', totalUnits: 80 },
        { id: 't2', name: 'Tower B', totalFloors: 20, floorStart: 1, unitsPerFloor: 4, flatNumberingPattern: '101-104', totalUnits: 80 },
        { id: 't3', name: 'Tower C', totalFloors: 20, floorStart: 1, unitsPerFloor: 4, flatNumberingPattern: '101-104', totalUnits: 80 },
    ],
    amenities: [
        { id: 'a1', name: 'Swimming Pool', type: 'pool', isActive: true },
        { id: 'a2', name: 'Clubhouse', type: 'clubhouse', isActive: true },
        { id: 'a3', name: 'Gym', type: 'gym', isActive: true },
        { id: 'a4', name: 'Parking', type: 'parking', isActive: true },
    ],
    possessionStatus: 'handed-over',
    handoverStatus: 'builder-managed',
    roles: [
        { id: 'r1', name: 'Property Partner Admin', email: 'admin@builder.com', mobile: '9876543210', role: 'admin', assignedAt: new Date(), assignedBy: 'system', isActive: true },
    ],
    members: [
        { id: 'm1', name: 'Rajesh Kumar', mobile: '9876543211', towerId: 't1', towerName: 'Tower A', flatNumber: '101', floor: 1, memberType: 'owner', isVerified: true, invitedAt: new Date(), joinedAt: new Date(), invitedBy: 'admin' },
        { id: 'm2', name: 'Priya Singh', mobile: '9876543212', towerId: 't1', towerName: 'Tower A', flatNumber: '102', floor: 1, memberType: 'owner', isVerified: false, invitedAt: new Date(), invitedBy: 'admin' },
    ],
    services: { maintenance: true, security: true, facilityManagement: false },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'builder@example.com',
    isLocked: false,
});

const HANDOVER_STATUS_CONFIG = {
    'builder-managed': { label: 'Property Partner Managed', color: 'bg-blue-100 text-blue-800', description: 'You have full control over the society' },
    'transitioning': { label: 'Transitioning to RWA', color: 'bg-amber-100 text-amber-800', description: 'Handover process is in progress' },
    'fully-handed-over': { label: 'Handed Over', color: 'bg-green-100 text-green-800', description: 'Society is now managed by RWA' },
};

interface SocietyDashboardPageProps {
    params: Promise<{
        societyId: string;
    }>;
}

export default function SocietyDashboardPage({ params: paramsPromise }: SocietyDashboardPageProps) {
    const params = use(paramsPromise);
    const [society] = useState<Society>(getMockSociety(params.societyId));
    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'documents' | 'handover'>('overview');

    const handoverConfig = HANDOVER_STATUS_CONFIG[society.handoverStatus];
    const verifiedMembers = society.members.filter(m => m.isVerified).length;
    const occupancyRate = Math.round((society.members.length / society.totalUnits) * 100);

    const handleHandoverStatusChange = (newStatus: HandoverStatus) => {
        // In real app, this would call an API
        console.log('Changing handover status to:', newStatus);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Link href="/property-partner/dashboard" className="hover:text-gray-900">Dashboard</Link>
                                <span>→</span>
                                <Link href="/property-partner/society" className="hover:text-gray-900">Societies</Link>
                                <span>→</span>
                                <span className="text-gray-900 font-medium">{society.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-bold text-gray-900">{society.name}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${handoverConfig.color}`}>
                                    {handoverConfig.label}
                                </span>
                            </div>
                            <p className="text-gray-600 mt-1">{society.projectName} • {society.city}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/property-partner/society/${society.id}/members`}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Invite Members
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{society.totalTowers}</p>
                            <p className="text-sm text-gray-600">Towers</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{society.totalUnits}</p>
                            <p className="text-sm text-gray-600">Total Units</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{society.members.length}</p>
                            <p className="text-sm text-gray-600">Members</p>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg">
                            <p className="text-2xl font-bold text-amber-600">{verifiedMembers}</p>
                            <p className="text-sm text-gray-600">Verified</p>
                        </div>
                        <div className="text-center p-3 bg-indigo-50 rounded-lg">
                            <p className="text-2xl font-bold text-indigo-600">{occupancyRate}%</p>
                            <p className="text-sm text-gray-600">Occupancy</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-8">
                        {(['overview', 'members', 'documents', 'handover'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === tab
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Towers */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Towers</h2>
                                <div className="space-y-3">
                                    {society.towers.map((tower) => (
                                        <div key={tower.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{tower.name}</p>
                                                <p className="text-sm text-gray-600">{tower.totalFloors} floors • {tower.unitsPerFloor} units/floor</p>
                                            </div>
                                            <p className="text-lg font-bold text-blue-600">{tower.totalUnits} units</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {society.amenities.map((amenity) => (
                                        <div key={amenity.id} className={`flex items-center gap-3 p-3 rounded-lg ${amenity.isActive ? 'bg-green-50' : 'bg-gray-50'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${amenity.isActive ? 'bg-green-100' : 'bg-gray-200'}`}>
                                                <svg className={`w-4 h-4 ${amenity.isActive ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className={`font-medium ${amenity.isActive ? 'text-gray-900' : 'text-gray-500'}`}>{amenity.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Services */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Enabled Services</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className={`p-4 rounded-lg border-2 ${society.services.maintenance ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">Maintenance</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${society.services.maintenance ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {society.services.maintenance ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">Track and manage maintenance requests</p>
                                </div>
                                <div className={`p-4 rounded-lg border-2 ${society.services.security ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">Security</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${society.services.security ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {society.services.security ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">Visitor management and gate passes</p>
                                </div>
                                <div className={`p-4 rounded-lg border-2 ${society.services.facilityManagement ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">Facility Management</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${society.services.facilityManagement ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {society.services.facilityManagement ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">Amenity bookings and scheduling</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Members */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Recent Members</h2>
                                <Link href={`/property-partner/society/${society.id}/members`} className="text-blue-600 text-sm font-medium hover:text-blue-700">
                                    View all →
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Name</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Flat</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Type</th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {society.members.slice(0, 5).map((member) => (
                                            <tr key={member.id} className="border-t border-gray-100">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">{member.name}</p>
                                                    <p className="text-sm text-gray-500">{member.mobile}</p>
                                                </td>
                                                <td className="px-4 py-3 text-gray-900">{member.towerName} - {member.flatNumber}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${member.memberType === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        {member.memberType}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${member.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {member.isVerified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-in fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Members ({society.members.length})</h2>
                            <Link
                                href={`/property-partner/society/${society.id}/members`}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Invite Members
                            </Link>
                        </div>
                        <div className="text-center py-8 text-gray-500">
                            <p>Go to the Members page to manage all members</p>
                        </div>
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-in fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Handover Documents</h2>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Upload Document
                            </button>
                        </div>
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>No documents uploaded yet</p>
                            <p className="text-sm">Upload handover documents, NOCs, and other important files</p>
                        </div>
                    </div>
                )}

                {/* Handover Tab */}
                {activeTab === 'handover' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Current Status */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Handover Status</h2>
                            <div className={`p-4 rounded-lg ${handoverConfig.color.replace('text-', 'border-').replace('bg-', 'bg-')}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-gray-900">{handoverConfig.label}</p>
                                        <p className="text-sm text-gray-600">{handoverConfig.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Handover Controls */}
                        {!society.isLocked && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Change Handover Status</h2>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => handleHandoverStatusChange('builder-managed')}
                                        disabled={society.handoverStatus === 'builder-managed'}
                                        className={`p-4 rounded-lg border-2 text-left transition ${society.handoverStatus === 'builder-managed'
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <p className="font-semibold text-gray-900">Property Partner Managed</p>
                                        <p className="text-sm text-gray-600 mt-1">Full control with builder</p>
                                    </button>
                                    <button
                                        onClick={() => handleHandoverStatusChange('transitioning')}
                                        disabled={society.handoverStatus === 'transitioning'}
                                        className={`p-4 rounded-lg border-2 text-left transition ${society.handoverStatus === 'transitioning'
                                                ? 'border-amber-500 bg-amber-50'
                                                : 'border-gray-200 hover:border-amber-300'
                                            }`}
                                    >
                                        <p className="font-semibold text-gray-900">Transitioning to RWA</p>
                                        <p className="text-sm text-gray-600 mt-1">Handover in progress</p>
                                    </button>
                                    <button
                                        onClick={() => handleHandoverStatusChange('fully-handed-over')}
                                        disabled={society.handoverStatus === 'fully-handed-over'}
                                        className={`p-4 rounded-lg border-2 text-left transition ${society.handoverStatus === 'fully-handed-over'
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200 hover:border-green-300'
                                            }`}
                                    >
                                        <p className="font-semibold text-gray-900">Fully Handed Over</p>
                                        <p className="text-sm text-gray-600 mt-1">RWA takes control</p>
                                    </button>
                                </div>

                                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex gap-3">
                                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-amber-800">Important</p>
                                            <p className="text-sm text-amber-700">
                                                Once fully handed over, your access will become read-only. Financial controls will transfer to the RWA.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {society.isLocked && (
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <p className="font-medium text-gray-900">Society is Locked</p>
                                <p className="text-sm text-gray-600 mt-1">This society has been fully handed over. You have read-only access.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
