'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

type CommissionStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

interface Commission {
    id: string;
    amount: string;
    percentage: string | null;
    agentId: string;
    propertyId: string;
    status: CommissionStatus;
    paidAt: string | null;
    notes: string | null;
    createdAt: string;
}

const STATUS_STYLES: Record<CommissionStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    PAID: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
};

export default function CommissionsPage() {
    const { token } = useAuth();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(
                `${API_URL}/api/commissions?page=${currentPage}&limit=${itemsPerPage}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.ok) {
                const result = await res.json();
                // API returns array directly
                const list = Array.isArray(result) ? result : result.data ?? [];
                setCommissions(list);
                setTotalCount(Array.isArray(result) ? list.length : result.total ?? list.length);
            }
        } catch (err) {
            console.error('Failed to fetch commissions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token, currentPage]);

    const pendingCount = commissions.filter(c => c.status === 'PENDING').length;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Commissions</h1>
                <p className="text-gray-600 mt-1">Review, approve and manage all platform commissions</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium">Total</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalCount}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium">Pending (This Page)</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium">Paid (This Page)</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        {commissions.filter(c => c.status === 'PAID').length}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <th className="py-3 px-4">Amount</th>
                                <th className="py-3 px-4">%</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Property</th>
                                <th className="py-3 px-4">Created</th>
                                <th className="py-3 px-4">Paid At</th>
                                <th className="py-3 px-4">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : commissions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                                        No commissions found.
                                    </td>
                                </tr>
                            ) : (
                                commissions.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition">
                                        <td className="py-4 px-4 font-semibold text-gray-900">
                                            ₹{parseFloat(c.amount).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-4 text-gray-700">
                                            {c.percentage ? `${c.percentage}%` : '—'}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[c.status]}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-xs text-gray-500 font-mono truncate max-w-[120px]">
                                            {c.propertyId.slice(0, 8)}…
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-600">
                                            {new Date(c.createdAt).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-600">
                                            {c.paidAt ? new Date(c.paidAt).toLocaleDateString('en-IN') : '—'}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-500">
                                            {c.notes || '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalCount > 0 && totalPages > 1 && (
                    <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-[12px] font-medium text-gray-400 tracking-wide">
                            Showing <span className="text-gray-900 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</span> to{' '}
                            <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
                            <span className="text-gray-900 font-bold">{totalCount}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
