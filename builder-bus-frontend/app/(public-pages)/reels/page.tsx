'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Navbar from '@/app/components/Navbar';
import ReelCard from '@/app/components/ReelCard';
import { reelService, Reel } from '@/app/services/reelService';

const PAGE_SIZE = 4;

export default function ReelsPage() {
    const [reels, setReels] = useState<Reel[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFetchingRef = useRef(false);

    const fetchReels = useCallback(async (pageNum: number) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        try {
            const res = await reelService.getAll(pageNum, PAGE_SIZE);
            setReels(prev => pageNum === 1 ? res.data : [...prev, ...res.data]);
            setHasMore(res.hasMore);
            setPage(pageNum);
        } catch (err) {
            setError('Failed to load reels. Please try again later.');
            console.error(err);
        } finally {
            isFetchingRef.current = false;
            setInitialLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchReels(1);
    }, [fetchReels]);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-50/50 border border-blue-100 rounded-full mb-8 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                        </span>
                        Trending Reels
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                        Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dream Home</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
                        Watch short property showcases and expert tips from our top partners.
                    </p>
                </header>

                {/* Error state */}
                {error && (
                    <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-300 max-w-lg mx-auto">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.194-1.333-2.964 0L2.732 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-gray-900 text-xl font-bold mb-2">{error}</p>
                        <button
                            onClick={() => { setError(null); setInitialLoading(true); fetchReels(1); }}
                            className="text-blue-600 font-black uppercase text-sm tracking-widest hover:text-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Initial skeleton */}
                {initialLoading && !error && (
                    <div className="flex flex-wrap justify-center gap-10">
                        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                            <div key={i} className="w-full max-w-[320px] aspect-[9/16] bg-gray-100 animate-pulse rounded-2xl border border-gray-200 shadow-sm" />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!initialLoading && !error && reels.length === 0 && (
                    <div className="text-center py-32 bg-gray-50 rounded-3xl border border-dashed border-gray-300 max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl rotate-12 flex items-center justify-center mx-auto mb-8 border border-blue-100 shadow-md">
                            <svg className="w-10 h-10 -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-900 text-2xl font-black mb-3">No Reels Yet</p>
                        <p className="text-gray-500 text-lg font-medium max-w-md mx-auto">Our partners are currently filming their latest properties. Check back soon!</p>
                    </div>
                )}

                {/* Reels grid */}
                {!initialLoading && !error && reels.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-10">
                        {reels.map((reel) => (
                            <div key={reel.id} className="w-full max-w-[320px]">
                                <ReelCard reel={reel} />
                            </div>
                        ))}
                        {/* Skeleton cards appended while loading more */}
                        {loadingMore && Array.from({ length: 4 }).map((_, i) => (
                            <div key={`skeleton-${i}`} className="w-full max-w-[320px] aspect-[9/16] bg-gray-100 animate-pulse rounded-2xl border border-gray-200 shadow-sm" />
                        ))}
                    </div>
                )}

                {/* Load More Button - Explicit user action to seeing more content */}
                {!initialLoading && !error && hasMore && (
                    <div className="text-center mt-12">
                        <button
                            onClick={() => {
                                setLoadingMore(true);
                                fetchReels(page + 1);
                            }}
                            disabled={loadingMore}
                            className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-blue-50 transition-all disabled:opacity-50 shadow-lg shadow-blue-50"
                        >
                            {loadingMore ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    Load More Reels
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* End of feed message */}
                {!hasMore && reels.length > 0 && (
                    <div className="text-center mt-16 mb-4">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 border border-gray-200 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">End of Feed</p>
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        </div>
                    </div>
                )}
            </main>

            {/* CTA Section */}
            <section className="bg-gray-50 py-24 border-t border-gray-100 mt-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Are You a Property Partner?</h2>
                    <p className="text-gray-600 text-lg font-medium mb-10 max-w-xl mx-auto leading-relaxed">Boost your reach and showcase your properties to thousands of potential buyers through our high-engagement Reels feature.</p>
                    <a href="/signin" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 hover:-translate-y-1">
                        Start Uploading
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>
            </section>
        </div>
    );
}
