'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { Property, PropertyStatus } from '@/app/types/property';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ListingRequestsPage() {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const regionCode = activeContext.activeRegion.code;

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = async () => {
        if (!token || !regionCode) return;
        setLoading(true);
        try {
            // Try to get city from active region or as a fallback from user groups/role context
            let managerCity = activeContext.activeRegion.city;

            // If still no city and manager is Nathdwara (based on role name), fallback for testing
            if (!managerCity && activeContext.activeRegion.code === 'no-region') {
                // We'll let the backend handle it or try to find a valid region
            }

            const cityParam = managerCity ? `city=${encodeURIComponent(managerCity)}` : '';
            const url = `${API_URL}/api/${regionCode}/properties?${cityParam}`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter for SUBMITTED properties
                const submitted = data.filter((p: any) => p.status === 'SUBMITTED');
                setRequests(submitted);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [token, regionCode, activeContext.activeRegion.city]);

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!token || !regionCode) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${API_URL}/api/${regionCode}/properties/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
                })
            });

            if (res.ok) {
                fetchRequests();
            } else {
                alert(`Failed to ${action.toLowerCase()} request`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    };

    // Extract unique cities from requests
    const cities = ['all', ...Array.from(new Set(requests.map(r => r.location.split(',').pop()?.trim() || 'Unknown')))];

    const filteredRequestsByCity = selectedCity === 'all'
        ? requests
        : requests.filter(r => {
            const propCity = r.location.split(',').pop()?.trim().toLowerCase() || 'unknown';
            return propCity === selectedCity.toLowerCase();
        });

    const filteredRequests = filteredRequestsByCity.filter(r => {
        const searchStr = `${r.name} ${r.location} ${r.onboardedBy?.name || ''}`.toLowerCase();
        return searchStr.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Listing Requests</h1>
                    <p className="text-gray-600 mt-1">Review and approve property listings from partners</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative flex-1 sm:min-w-[300px]">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                        >
                            <option value="all">All Cities</option>
                            {cities.filter(c => c !== 'all').map(city => (
                                <option key={city} value={city}>{city.charAt(0).toUpperCase() + city.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading requests...</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📋</div>
                    <h3 className="text-lg font-bold text-gray-900">No Pending Requests</h3>
                    <p className="text-gray-500 mt-1">There are no property listings waiting for review {selectedCity !== 'all' ? `in ${selectedCity}` : 'at the moment'}.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredRequests.map(request => (
                        <div key={request.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                            <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 truncate">{request.name}</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
                                            New Request
                                        </span>
                                    </div>
                                    <p className="text-gray-600 flex items-center gap-2 text-sm mb-4">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {request.location}
                                    </p>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Type</p>
                                            <p className="font-bold text-gray-700 capitalize">{request.category?.toLowerCase() || 'Flat'}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
                                            <p className="font-bold text-blue-600">₹{(parseFloat(request.price) / 100000).toFixed(1)}L+</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Area</p>
                                            <p className="font-bold text-gray-700">{request.area} sq.ft</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">City</p>
                                            <p className="font-bold text-gray-700 truncate">{request.location.split(',').pop()?.trim() || 'Unknown'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 lg:min-w-[200px]">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Submitted By</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">
                                            {request.onboardedBy?.name?.charAt(0) || 'P'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate">{request.onboardedBy?.name || 'Unknown Partner'}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Verified Partner</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col gap-3 shrink-0">
                                    <button
                                        onClick={() => handleAction(request.id, 'APPROVE')}
                                        disabled={!!processingId}
                                        className="flex-1 px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processingId === request.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => handleAction(request.id, 'REJECT')}
                                        disabled={!!processingId}
                                        className="flex-1 px-6 py-2.5 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>

                            {/* Expandable Preview Section */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description Preview</p>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {request.description || 'No description provided by partner.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
