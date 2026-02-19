'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import AddInfluencerModal from '@/app/components/central-authority/AddInfluencerModal';

export default function InfluencersPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { token } = useAuth();
    const [influencers, setInfluencers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Fetch data
    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/central-authority/users?role=influencer&page=${currentPage}&limit=${itemsPerPage}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const result = await res.json();
                setInfluencers(result.data);
                setTotalCount(result.total);
            }
        } catch (err) {
            console.error('Failed to fetch influencers', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, currentPage, API_URL]);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Influencers</h1>
                <p className="text-gray-600 mt-1">Manage marketing influencers and platform promoters</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Influencers</div>
                    <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Total Reach</div>
                    <div className="text-3xl font-bold text-blue-600">
                        {influencers.reduce((sum, i) => sum + (i.influencerProfile?.reach || 0), 0).toLocaleString()}+
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium mb-2">Active campaigns</div>
                    <div className="text-3xl font-bold text-green-600">0</div>
                </div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search influencers..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Influencer
                </button>
            </div>

            {/* Influencers List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-[#F8FAFC] text-gray-400 font-bold text-[10px] uppercase tracking-[0.1em] border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Niche</th>
                                <th className="px-6 py-4">Reach</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                        Loading influencers...
                                    </td>
                                </tr>
                            ) : influencers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 italic">
                                        No influencers found.
                                    </td>
                                </tr>
                            ) : influencers.map((influencer) => (
                                <tr key={influencer.id} className="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-semibold text-gray-900">{influencer.firstName} {influencer.lastName}</div>
                                            <div className="text-xs text-gray-500">{influencer.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{influencer.influencerProfile?.niche || 'Not specified'}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {(influencer.influencerProfile?.reach || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${influencer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {influencer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(influencer.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:underline text-xs font-bold uppercase tracking-tighter">
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && totalCount > 0 && (
                    <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-[12px] font-medium text-gray-400 tracking-wide">
                            Showing <span className="text-gray-900 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="text-gray-900 font-bold">{totalCount}</span> influencers
                        </div>
                        {totalPages > 1 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Influencer Modal */}
            <AddInfluencerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
