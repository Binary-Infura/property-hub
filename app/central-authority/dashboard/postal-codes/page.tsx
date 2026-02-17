'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface PostalCode {
    id: string;
    code: string;
    officeName: string;
    officeType: string;
    delivery: string;
    district: string;
    stateName: string;
    latitude: string;
    longitude: string;
}

interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function PostalCodesPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [postalCodes, setPostalCodes] = useState<PostalCode[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const fetchPostalCodes = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/postal-codes?page=${page}&limit=20&search=${search}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setPostalCodes(data.items);
                    setMeta(data.meta);
                }
            } catch (error) {
                console.error('Failed to fetch postal codes:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchPostalCodes, 500);
        return () => clearTimeout(timeoutId);
    }, [token, page, search, API_URL]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Postal Codes</h1>
                    <p className="text-gray-500 text-sm">Manage and view all postal code data across the platform.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 mb-4"
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by code, office, district or state..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-wider border-y border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Pincode</th>
                                <th className="px-6 py-4">Office Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">District</th>
                                <th className="px-6 py-4">State</th>
                                <th className="px-6 py-4">Delivery</th>
                                <th className="px-6 py-4">Coordinates</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && postalCodes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                            <span className="text-gray-400">Loading data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : postalCodes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400 italic">
                                        No postal codes found.
                                    </td>
                                </tr>
                            ) : (
                                postalCodes.map((pc) => (
                                    <tr key={pc.id} className="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                                        <td className="px-6 py-4 font-bold text-slate-900">{pc.code}</td>
                                        <td className="px-6 py-4 font-medium text-gray-700">{pc.officeName}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                                                {pc.officeType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{pc.district}</td>
                                        <td className="px-6 py-4">{pc.stateName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${pc.delivery === 'Delivery'
                                                    ? 'bg-green-50 text-green-700 border border-green-100'
                                                    : 'bg-orange-50 text-orange-700 border border-orange-100'
                                                }`}>
                                                {pc.delivery}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[11px] text-gray-400 font-mono">
                                            {pc.latitude && pc.longitude ? `${pc.latitude}, ${pc.longitude}` : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {meta && meta.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                        <div className="text-sm text-gray-500">
                            Showing page <span className="font-semibold text-gray-900">{meta.page}</span> of <span className="font-semibold text-gray-900">{meta.totalPages}</span>
                            <span className="ml-4 text-xs">Total records: {meta.total}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
