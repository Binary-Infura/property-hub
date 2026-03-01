'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { reelService, Reel } from '@/app/services/reelService';
import SidebarIcon from '@/app/components/SidebarIcon';
import ReelsUploadModal from '@/app/components/property-partner/ReelsUploadModal';
import ReelCard from '@/app/components/ReelCard';

export default function PropertyPartnerReelsPage() {
    const { token } = useAuth();
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMyReels = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await reelService.getMy(token);
            setReels(data);
        } catch (err) {
            setError('Failed to load your reels');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyReels();
    }, [token]);

    const handleDelete = async (id: string) => {
        if (!token || !confirm('Are you sure you want to delete this reel?')) return;
        try {
            await reelService.delete(id, token);
            setReels(reels.filter(r => r.id !== id));
        } catch (err) {
            alert('Failed to delete reel');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-blue-50/50 text-blue-600 rounded-xl border border-blue-100 shadow-sm">
                                <SidebarIcon name="video" className="w-6 h-6" />
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Manage Your Reels</h1>
                        </div>
                        <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-lg">Showcase your properties with engaging short-form video content to attract more buyers.</p>
                    </div>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="group flex items-center gap-3 bg-blue-600 text-white px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 active:translate-y-0"
                    >
                        <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                            <SidebarIcon name="plus" className="w-4 h-4" />
                        </div>
                        Post New Reel
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {error && (
                    <div className="mb-8 p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold flex items-center gap-4 animate-in slide-in-from-top-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[9/16] bg-white border border-gray-100 rounded-3xl animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : reels.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 max-w-2xl mx-auto shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white shadow-inner rotate-3">
                            <svg className="w-12 h-12 -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-gray-900 text-3xl font-black mb-3">No Reels Posted Yet</h3>
                        <p className="text-gray-500 text-lg font-medium max-w-sm mx-auto mb-10 leading-relaxed">Boost your property visibility today by posting your first short-form video!</p>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="text-blue-600 font-black uppercase text-sm tracking-[0.2em] hover:text-blue-700 transition-colors flex items-center gap-4 mx-auto"
                        >
                            Post My First Reel
                            <svg className="w-5 h-5 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {reels.map((reel) => (
                            <div key={reel.id} className="relative group perspective-1000">
                                <ReelCard reel={reel} />
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <button
                                        onClick={() => handleDelete(reel.id)}
                                        className="p-3.5 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 hover:scale-110 border border-white/20 transition-all shadow-xl shadow-black/10"
                                        title="Delete Reel"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <div className="bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20 shadow-lg shadow-green-500/20">
                                        Live Now
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {token && (
                <ReelsUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    token={token}
                    onSuccess={fetchMyReels}
                />
            )}
        </div>
    );
}
