'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CentralAuthorityListingRequestsPage() {
    const { token } = useAuth();

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [processingId, setProcessingId] = useState<string | null>(null);

    const getPartnerName = (onboardedBy: any) => {
        if (!onboardedBy) return 'Unknown Partner';
        return onboardedBy.profileData?.companyName ||
            onboardedBy.propertyPartnerProfile?.companyName ||
            onboardedBy.agencyName ||
            `${onboardedBy.firstName || ''} ${onboardedBy.lastName || ''}`.trim() ||
            'Unknown Partner';
    };

    const fetchRequests = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/projects?status=SUBMITTED`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
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
    }, [token]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCity, searchQuery]);

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!token) return;
        setProcessingId(id);
        try {
            const res = await fetch(`${API_URL}/api/projects/${id}`, {
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

    const cities = ['all', ...Array.from(new Set(requests.map(r => r.location.split(',').pop()?.trim() || 'Unknown')))];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Listing Requests</h1>
                    <p className="text-gray-600 mt-1">Review and approve project listings from partners</p>
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
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">Fetching listing requests...</p>
                </div>
            ) : (() => {
                const filtered = requests.filter(r => {
                    const matchesCity = selectedCity === 'all' || r.location.toLowerCase().includes(selectedCity.toLowerCase());
                    const partnerName = getPartnerName(r.onboardedBy);
                    const searchStr = `${r.name} ${r.location} ${partnerName}`.toLowerCase();
                    const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
                    return matchesCity && matchesSearch;
                });

                if (filtered.length === 0) {
                    return (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-lg">
                                {searchQuery || selectedCity !== 'all'
                                    ? `No requests matching your filters`
                                    : 'No pending listing requests found.'}
                            </p>
                        </div>
                    );
                }

                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

                return (
                    <div className="space-y-8">
                        <div className="grid gap-6">
                            {paginatedData.map(request => (
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
                                                    <p className="font-bold text-gray-700 capitalize">{(request as any).propertyType || 'Flat'}</p>
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
                                                    {getPartnerName(request.onboardedBy).charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{getPartnerName(request.onboardedBy)}</p>
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
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm text-gray-500 font-medium">
                                    Showing <span className="text-gray-900">{startIndex + 1}</span> to <span className="text-gray-900">{Math.min(startIndex + itemsPerPage, filtered.length)}</span> of <span className="text-gray-900">{filtered.length}</span> requests
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === page
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
}
