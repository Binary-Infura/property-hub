'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import AddRegionModal from '@/app/components/central-authority/AddRegionModal';
import DisableRegionModal from '@/app/components/central-authority/DisableRegionModal';

interface Region {
    id: string;
    name: string;
    code: string;
    active: boolean;
    country?: string;
    state?: string;
    city?: string;
    tags?: string[];
    description?: string;
    propertiesCount?: number;
    revenue?: number;
    location?: {
        continent: string;
        country: string;
        state: string;
        city: string;
    };
}

export default function RegionsPage() {
    const { token } = useAuth();
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRegion, setEditingRegion] = useState<Region | null>(null);
    const [regionToDisable, setRegionToDisable] = useState<Region | null>(null);
    const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRegions, setTotalRegions] = useState(0);
    const limit = 10;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchRegions = async (page: number = currentPage) => {
        setLoading(true);
        try {
            const endpoint = `${API_URL}/api/regions/managed?page=${page}&limit=${limit}`;
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const result = await response.json();
                setRegions(result.data);
                setTotalRegions(result.total);
            }
        } catch (err) {
            console.error('Failed to fetch regions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchRegions(currentPage);
        }
    }, [token, currentPage]);

    const handleEdit = (region: Region) => {
        setEditingRegion(region);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (region: Region) => {
        if (region.active) {
            // Require code confirmation for disabling
            setRegionToDisable(region);
            setIsDisableModalOpen(true);
            return;
        }

        // Direct enable for inactive regions
        try {
            const response = await fetch(`${API_URL}/api/regions/${region.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    active: true
                })
            });
            if (response.ok) {
                fetchRegions(currentPage);
            }
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };

    const confirmDisable = async () => {
        if (!regionToDisable) return;

        try {
            const response = await fetch(`${API_URL}/api/regions/${regionToDisable.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    active: false
                })
            });
            if (response.ok) {
                fetchRegions(currentPage);
                setIsDisableModalOpen(false);
                setRegionToDisable(null);
            }
        } catch (err) {
            console.error('Failed to disable region:', err);
        }
    };

    const closePortal = () => {
        setIsModalOpen(false);
        setEditingRegion(null);
    };

    const totalPages = Math.ceil(totalRegions / limit);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Region Management</h1>
                    <p className="text-gray-600 mt-2">Manage all regions and their details.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Region
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-[#F8FAFC] text-gray-400 font-bold text-[10px] uppercase tracking-[0.1em] border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Region Details</th>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Tags</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Inventory</th>
                                <th className="px-6 py-4">Financials</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading regions...
                                        </div>
                                    </td>
                                </tr>
                            ) : regions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                                        No regions found. Click "Add New Region" to get started.
                                    </td>
                                </tr>
                            ) : (
                                regions.map((region) => (
                                    <tr key={region.id} className="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 leading-none">{region.name}</div>
                                            <div className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                                                {[region.location?.city || region.city, region.location?.state || region.state, region.location?.country || region.country].filter(Boolean).join(' • ')}
                                            </div>
                                            {region.description && (
                                                <div className="text-xs text-gray-500 mt-2 line-clamp-1 italic bg-gray-50/50 p-1.5 rounded-lg border border-gray-100/50">
                                                    {region.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 inline-block">
                                                {region.code}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                {region.tags && region.tags.length > 0 ? (
                                                    region.tags.map((tag, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md border border-blue-100 uppercase tracking-tighter">
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-300 italic text-[10px]">No tags</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${region.active ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                                {region.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{region.propertiesCount || 0}</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-medium">units</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">₹{((region.revenue || 0) / 100000).toFixed(1)}L</span>
                                                <span className="text-[10px] text-gray-400 uppercase font-medium">revenue</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(region)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 group"
                                                    title="Edit Region"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(region)}
                                                    className={`p-2 rounded-lg transition-colors border border-transparent ${region.active ? 'text-amber-600 hover:bg-amber-50 hover:border-amber-100' : 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'}`}
                                                    title={region.active ? 'Disable Region' : 'Enable Region'}
                                                >
                                                    {region.active ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Showing <span className="text-gray-900 font-bold">{regions.length}</span> of <span className="text-gray-900 font-bold">{totalRegions}</span> regions
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-tighter"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || loading}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-tighter"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <AddRegionModal
                isOpen={isModalOpen}
                initialData={editingRegion}
                onClose={closePortal}
                onSuccess={() => {
                    fetchRegions(currentPage);
                    closePortal();
                }}
            />

            <DisableRegionModal
                isOpen={isDisableModalOpen}
                onClose={() => {
                    setIsDisableModalOpen(false);
                    setRegionToDisable(null);
                }}
                onConfirm={confirmDisable}
                regionName={regionToDisable?.name || ''}
                regionCode={regionToDisable?.code || ''}
            />
        </div>
    );
}
