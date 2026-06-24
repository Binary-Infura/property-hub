'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

interface Invitation {
    id: string;
    email: string | null;
    phone: string | null;
    roles: string[];
    status: string;
    token: string;
    expiresAt: string;
    createdAt: string;
    invitedBy: {
        firstName: string;
        lastName: string | null;
        email: string;
    };
}

export default function AllInvitationsPage() {
    const { token } = useAuth();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

    const fetchInvitations = async (pageNumber: number) => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/central-authority/invitations?page=${pageNumber}&limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                setInvitations(result.data);
                setTotal(result.total);
            }
        } catch (error) {
            console.error('Failed to fetch invitations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvitations(page);
    }, [token, page]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Platform Invitations</h1>
                    <p className="text-gray-600 mt-2">Manage all invitations sent across the property hub platform.</p>
                </div>
                <Link 
                    href="/dashboard"
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Roles</th>
                                <th className="px-6 py-4">Sent By</th>
                                <th className="px-6 py-4">Sent Date</th>
                                <th className="px-6 py-4">Expiry</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : invitations.length > 0 ? (
                                invitations.map((inv) => (
                                    <tr key={inv.id} className="text-sm group hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{inv.email || inv.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                inv.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                inv.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {inv.roles.map((role) => (
                                                    <span key={role} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                                                        {role.replace('_', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900 text-xs">{inv.invitedBy.firstName} {inv.invitedBy.lastName}</p>
                                                <p className="text-[10px] text-gray-400">{inv.invitedBy.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(inv.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(inv.expiresAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                                        No invitations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <p className="text-xs text-gray-500 font-medium">
                            Showing <span className="text-gray-900 font-bold">{invitations.length}</span> of <span className="text-gray-900 font-bold">{total}</span> invitations
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all font-bold text-xs uppercase tracking-tighter"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1 px-2">
                                <span className="text-xs font-bold text-blue-600">{page}</span>
                                <span className="text-xs text-gray-400">/</span>
                                <span className="text-xs font-bold text-gray-600">{totalPages}</span>
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || loading}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all font-bold text-xs uppercase tracking-tighter"
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
