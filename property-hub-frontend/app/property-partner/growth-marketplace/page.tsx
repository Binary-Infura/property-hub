'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { growthPartnerService, GrowthPartner } from '@/app/services/growthPartnerService';
import { useAuth } from '@/app/contexts/AuthContext';
import CollaborationRequestModal from '@/app/components/growth-marketplace/CollaborationRequestModal';
import { marketingService } from '@/app/services/marketingService';
import Link from 'next/link';

export default function GrowthMarketplace() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<'discover' | 'history'>('discover');
    const [partners, setPartners] = useState<GrowthPartner[]>([]);
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 6;

    const [filters, setFilters] = useState<{
        search: string;
        platform: string;
        type: string;
        minBudget?: number;
        maxBudget?: number;
    }>({
        search: '',
        platform: '',
        type: '',
        minBudget: undefined,
        maxBudget: undefined,
    });

    const [selectedPartner, setSelectedPartner] = useState<any>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    useEffect(() => {
        if (token) {
            if (activeTab === 'discover') {
                fetchPartners();
            } else {
                fetchMyRequests();
            }
        }
    }, [token, filters, page, activeTab]);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const data = await growthPartnerService.findAll(token as string, { ...filters, page, limit });
            setPartners(data.data);
            setTotal(data.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRequests = async () => {
        setLoading(true);
        try {
            const data = await marketingService.getMyRequests(token as string);
            setMyRequests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = (partner: any) => {
        const profile = partner.profileData || {};
        setSelectedPartner({
            id: partner.id,
            name: `${partner.firstName} ${partner.lastName || ''}`,
            type: profile.type || 'Growth Partner',
            platforms: profile.platforms || []
        });
        setIsRequestModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF]">
            {/* Header section */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Growth Marketplace</h1>
                            <p className="text-gray-500 font-medium">Discover top growth partners to scale your projects</p>
                        </div>
                        
                        <div className="flex bg-gray-100 p-1 rounded-2xl md:mt-2">
                            <button 
                                onClick={() => setActiveTab('discover')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'discover' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Discover
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                My Requests
                            </button>
                        </div>
                    </div>

                    {activeTab === 'discover' && (
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    className="pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64 font-medium"
                                    value={filters.search}
                                    onChange={(e) => {
                                        setFilters({ ...filters, search: e.target.value });
                                        setPage(1);
                                    }}
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'discover' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm sticky top-28">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 8.293A1 1 0 013 7.586V4z" />
                                </svg>
                                Advanced Filters
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Partner Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Influencer', 'Agency', 'Freelancer'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    setFilters({ ...filters, type: filters.type === type ? '' : type });
                                                    setPage(1);
                                                }}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filters.type === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Platforms</label>
                                    <div className="space-y-2">
                                        {['Instagram', 'YouTube', 'Meta Ads', 'Google Ads', 'LinkedIn', 'TikTok'].map((p) => (
                                            <label key={p} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                                                    checked={filters.platform === p}
                                                    onChange={() => {
                                                        setFilters({ ...filters, platform: filters.platform === p ? '' : p });
                                                        setPage(1);
                                                    }}
                                                />
                                                <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">{p}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Starting Budget</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onChange={(e) => {
                                                setFilters({ ...filters, minBudget: e.target.value ? Number(e.target.value) : undefined });
                                                setPage(1);
                                            }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onChange={(e) => {
                                                setFilters({ ...filters, maxBudget: e.target.value ? Number(e.target.value) : undefined });
                                                setPage(1);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-80 bg-gray-100 rounded-[2.5rem] animate-pulse" />
                                ))}
                            </div>
                        ) : partners.length > 0 ? (
                            <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {partners.map((partner) => (
                                    <motion.div
                                        key={partner.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                                    >
                                        {/* Partner Card Content */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600 shadow-inner">
                                                    {(partner.firstName[0] + (partner.lastName?.[0] || '')).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                        {partner.firstName} {partner.lastName}
                                                    </h3>
                                                    <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-lg uppercase tracking-widest mt-1">
                                                        {partner.profileData?.type || 'Growth Partner'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="text-sm font-bold text-amber-900">{partner.profileData.rating || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6 h-10">
                                            {partner.profileData.bio || 'Professional growth partner specialized in scaling property brands and driving high-quality leads.'}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {(partner.profileData?.platforms || []).map((p) => (
                                                <span key={p} className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg uppercase border border-gray-100">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Starting Price</p>
                                                <p className="text-lg font-extrabold text-blue-600">₹{partner.profileData.startingPrice?.toLocaleString() || 'Custom'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/growth-partner/${partner.id}`}
                                                    className="px-5 py-3 rounded-xl bg-gray-50 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all border border-gray-100"
                                                >
                                                    Profile
                                                </Link>
                                                <button
                                                    onClick={() => handleRequest(partner)}
                                                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                                >
                                                    Request
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            
                            {/* Pagination Controls */}
                            {total > limit && (
                                <div className="mt-12 flex items-center justify-center gap-4">
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-6 py-3 rounded-2xl bg-white border border-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        Previous
                                    </button>
                                    <div className="px-6 py-3 rounded-2xl bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-widest border border-blue-100">
                                        Page {page} of {Math.ceil(total / limit)}
                                    </div>
                                    <button 
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= Math.ceil(total / limit)}
                                        className="px-6 py-3 rounded-2xl bg-white border border-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm flex items-center gap-2"
                                    >
                                        Next
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No Partners Found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                                <button
                                    onClick={() => {
                                        setFilters({ search: '', platform: '', type: '', minBudget: undefined, maxBudget: undefined });
                                        setPage(1);
                                    }}
                                    className="mt-6 text-blue-600 font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                ) : (
                    // Request History Tab Content
                    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900">Collaboration History</h2>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{myRequests.length} Proposals Sent</p>
                        </div>
                        
                        {loading ? (
                            <div className="p-20 text-center text-gray-400 font-bold animate-pulse">Loading your history...</div>
                        ) : myRequests.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Budget</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sent Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {myRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-600 text-sm">
                                                            {req.assignedTo?.[0]?.firstName?.[0] || 'G'}
                                                        </div>
                                                        <span className="font-bold text-gray-900">
                                                            {req.assignedTo?.[0]?.firstName} {req.assignedTo?.[0]?.lastName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="font-medium text-gray-600">{req.project?.name || 'N/A'}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg uppercase tracking-wider border border-gray-200">
                                                        {req.platform}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="font-bold text-gray-900">₹{req.budget.toLocaleString()}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        req.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                        req.status === 'PENDING' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm text-gray-400 font-medium">
                                                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-24 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No Proposals Yet</h3>
                                <p className="text-gray-500 mt-2 max-w-xs">Once you request a collaboration with a growth partner, it will appear here.</p>
                                <button 
                                    onClick={() => setActiveTab('discover')}
                                    className="mt-8 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                                >
                                    Browse Marketplace
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedPartner && (
                <CollaborationRequestModal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    partner={selectedPartner}
                    token={token as string}
                />
            )}
        </div>
    );
}
