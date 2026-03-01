'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { reraService } from '@/app/services/reraService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReraCountsPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [districtCounts, setDistrictCounts] = useState<any[]>([]);
    const [districtSearch, setDistrictSearch] = useState('');
    const [fetchingCounts, setFetchingCounts] = useState(true);
    const [selectedState, setSelectedState] = useState('rajasthan');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [states] = useState([
        { id: 'rajasthan', name: 'Rajasthan' },
        { id: 'maharashtra', name: 'Maharashtra' }
    ]);

    const fetchDistrictCounts = async () => {
        if (!token) return;
        setFetchingCounts(true);
        try {
            const counts = await reraService.getDistrictCounts(token, selectedState, districtSearch);
            setDistrictCounts(counts);
        } catch (error) {
            console.error('Failed to fetch district counts', error);
        } finally {
            setFetchingCounts(false);
        }
    };

    const sortedCounts = [...districtCounts].sort((a, b) => {
        if (sortOrder === 'desc') {
            return b.projectCount - a.projectCount;
        } else {
            return a.projectCount - b.projectCount;
        }
    });

    useEffect(() => {
        if (token) {
            fetchDistrictCounts();
        }
    }, [token, selectedState, districtSearch]);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">RERA Project Distribution</h1>
                    <p className="text-slate-500 mt-1">Detailed breakdown of registered projects across different districts.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                    Back
                </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-10">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">State</h3>
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer min-w-[180px]"
                        >
                            {states.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Sort by Projects</h3>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                            className="mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer min-w-[180px]"
                        >
                            <option value="desc">High to Low</option>
                            <option value="asc">Low to High</option>
                        </select>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Search District</h3>
                        <input
                            type="text"
                            placeholder="Optional district name..."
                            value={districtSearch}
                            onChange={(e) => setDistrictSearch(e.target.value)}
                            className="mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-w-[200px]"
                        />
                    </div>
                </div>
                {sortedCounts.length > 0 && !fetchingCounts && (
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Districts</span>
                        <span className="text-2xl font-black text-indigo-600">{sortedCounts.length}</span>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                <th className="px-6 py-4">District</th>
                                <th className="px-6 py-4">State</th>
                                <th className="px-6 py-4 text-center">Project Count</th>
                                <th className="px-6 py-4 text-right">Last Synced</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {fetchingCounts ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
                                            Loading counts...
                                        </div>
                                    </td>
                                </tr>
                            ) : sortedCounts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">
                                        No registered RERA project data found for {selectedState} in the database.
                                    </td>
                                </tr>
                            ) : (
                                sortedCounts.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 border-b border-slate-50 font-bold text-slate-900">
                                            {item.district}
                                        </td>
                                        <td className="px-6 py-4 border-b border-slate-50 text-sm text-slate-500">
                                            {item.state}
                                        </td>
                                        <td className="px-6 py-4 border-b border-slate-50 text-center">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-extrabold text-base">
                                                {item.projectCount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-slate-50 text-right text-xs text-slate-400">
                                            {new Date(item.updatedAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
