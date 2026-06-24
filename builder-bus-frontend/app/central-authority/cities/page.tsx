'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

export default function CentralAuthorityCitiesPage() {
    const { token } = useAuth();

    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    const [states, setStates] = useState<any[]>([]);
    const [selectedState, setSelectedState] = useState<string>('');
    const [syncingCities, setSyncingCities] = useState(false);
    const [syncResult, setSyncResult] = useState<{createdCount: number, updatedCount: number} | null>(null);

    const fetchStates = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/cities/india/states`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStates(data);
                if (data.length > 0 && !selectedState) {
                    setSelectedState(data[0].id);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchCities = async (page: number, stateFilter: string) => {
        if (!token || !stateFilter) return;
        setLoading(true);
        try {
            let url = `${API_URL}/api/cities/managed?page=${page}&limit=${itemsPerPage}`;
            url += `&state=${encodeURIComponent(stateFilter)}`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCities(data.data || []);
                setTotalItems(data.total || 0);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStates();
    }, [token]);

    useEffect(() => {
        fetchCities(currentPage, selectedState);
    }, [token, currentPage, selectedState]);

    const handleSyncCities = async () => {
        if (!token) return;
        setSyncingCities(true);
        setSyncResult(null);
        try {
            const response = await fetch(`${API_URL}/api/central-authority/sync-cities`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const result = await response.json();
                setSyncResult(result);
                // Refresh cities after sync
                fetchCities(currentPage, selectedState);
            } else {
                alert('Failed to sync cities');
            }
        } catch (error) {
            console.error('Error syncing cities:', error);
            alert('Error syncing cities');
        } finally {
            setSyncingCities(false);
        }
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const getPaginationRange = (current: number, total: number) => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
        if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Cities Management</h1>
                    <p className="text-gray-600 mt-1">View and manage all cities registered in the system</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    {/* State Filter */}
                    <select
                        value={selectedState}
                        onChange={(e) => {
                            setSelectedState(e.target.value);
                            setCurrentPage(1); // reset to page 1 on filter
                        }}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 w-full md:w-auto outline-none"
                    >
                        {states.length === 0 && <option value="">Loading states...</option>}
                        {states.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {syncResult && (
                            <div className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-100 font-medium">
                                Synced! +{syncResult.createdCount}, ~{syncResult.updatedCount}
                            </div>
                        )}
                        <button
                            onClick={handleSyncCities}
                            disabled={syncingCities}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto whitespace-nowrap"
                        >
                            {syncingCities ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Sync Cities
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">Fetching cities...</p>
                </div>
            ) : (() => {
                if (cities.length === 0) {
                    return (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-gray-400 text-lg">
                                No cities found in the system.
                            </p>
                        </div>
                    );
                }

                return (
                    <div className="space-y-6">
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {cities.map(city => (
                                <div key={city.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{city.name}</h3>
                                            <p className="text-sm font-medium text-gray-500">{city.state}</p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${city.active ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                            {city.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Projects</p>
                                            <p className="font-bold text-blue-600 text-lg">{city.projectsCount}</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                                            <p className="font-bold text-gray-700">₹{(city.revenue / 100000).toFixed(1)}L</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm mt-6">
                                <p className="text-sm text-gray-500 font-medium">
                                    Showing <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-gray-900">{totalItems}</span> cities
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
                                    <div className="flex items-center gap-1 overflow-x-auto scollbar-hide max-w-full">
                                        {getPaginationRange(currentPage, totalPages).map((page, idx) => (
                                            page === '...' ? (
                                                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 font-bold">...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page as number)}
                                                    className={`w-10 h-10 shrink-0 rounded-xl text-sm font-bold transition-all ${currentPage === page
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            )
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
