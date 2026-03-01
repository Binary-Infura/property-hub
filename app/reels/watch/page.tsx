'use client';

import React, { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { reelService, Reel } from '../../services/reelService';

const PAGE_SIZE = 10;

// ─── Inner viewer (needs useSearchParams, so wrapped in Suspense below) ─────
function ReelsViewer() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const startId = searchParams.get('id');

    const [reels, setReels] = useState<Reel[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [muted, setMuted] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [paused, setPaused] = useState<Record<number, boolean>>({});

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const isFetchingRef = useRef(false);
    const didScrollToStart = useRef(false);
    const pageRef = useRef(1);

    // ── fetch a page ──────────────────────────────────────────────────────────
    const fetchReels = useCallback(async (pageNum: number) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            const res = await reelService.getAll(pageNum, PAGE_SIZE);
            setReels(prev => pageNum === 1 ? res.data : [...prev, ...res.data]);
            setHasMore(res.hasMore);
            setPage(pageNum);
            pageRef.current = pageNum;
        } catch (e) {
            console.error(e);
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchReels(1); }, [fetchReels]);

    // ── scroll to startId once reels load ────────────────────────────────────
    useEffect(() => {
        if (!startId || didScrollToStart.current || reels.length === 0) return;
        const idx = reels.findIndex(r => r.id === startId);
        if (idx === -1) return;
        didScrollToStart.current = true;
        setActiveIndex(idx);
        requestAnimationFrame(() => {
            containerRef.current?.scrollTo({ top: idx * window.innerHeight });
        });
    }, [reels, startId]);

    // ── IntersectionObserver — auto play/pause, load-more trigger ────────────
    useEffect(() => {
        if (reels.length === 0) return;
        const observers: IntersectionObserver[] = [];

        videoRefs.current.forEach((video, idx) => {
            if (!video) return;
            const obs = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        video.muted = muted;
                        video.play().catch(() => { });
                        setActiveIndex(idx);
                        setPaused(p => ({ ...p, [idx]: false }));
                        // Trigger next page load when 3 reels from end
                        if (idx >= reels.length - 3 && hasMore && !isFetchingRef.current) {
                            fetchReels(pageRef.current + 1);
                        }
                    } else {
                        video.pause();
                    }
                },
                { threshold: 0.75 }
            );
            obs.observe(video);
            observers.push(obs);
        });

        return () => observers.forEach(o => o.disconnect());
    }, [reels, hasMore, muted, fetchReels]);

    // ── mute sync ────────────────────────────────────────────────────────────
    useEffect(() => {
        videoRefs.current.forEach(v => { if (v) v.muted = muted; });
    }, [muted]);

    // ── manual tap play/pause ────────────────────────────────────────────────
    const togglePlay = (idx: number) => {
        const v = videoRefs.current[idx];
        if (!v) return;
        if (v.paused) {
            v.play();
            setPaused(p => ({ ...p, [idx]: false }));
        } else {
            v.pause();
            setPaused(p => ({ ...p, [idx]: true }));
        }
    };

    // ── arrow navigation ─────────────────────────────────────────────────────
    const scrollTo = (idx: number) => {
        if (!containerRef.current || idx < 0 || idx >= reels.length) return;
        containerRef.current.scrollTo({ top: idx * window.innerHeight, behavior: 'smooth' });
    };

    // ── keyboard arrow keys ──────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') scrollTo(activeIndex + 1);
            if (e.key === 'ArrowUp') scrollTo(activeIndex - 1);
            if (e.key === 'Escape') router.back();
            if (e.key === 'm') setMuted(m => !m);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [activeIndex, router]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex select-none">

            {/* ── LEFT SIDEBAR (desktop) ─────────────────────────── */}
            <div className="hidden lg:flex flex-col justify-between py-10 pl-10 pr-6 w-56 flex-shrink-0">
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-3 text-white group w-fit"
                >
                    <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </div>
                    <span className="font-black text-sm tracking-wide">Back</span>
                </button>

                {/* Branding */}
                <div>
                    <div className="w-9 h-9 bg-blue-600 rounded-xl mb-3 flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-sm opacity-90" />
                    </div>
                    <p className="text-white font-black text-lg leading-tight">PropertyHub</p>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-0.5">Reels</p>
                    <p className="text-white/20 text-[10px] font-medium mt-4 leading-relaxed max-w-[120px]">
                        Scroll to explore property reels
                    </p>
                    <p className="text-white/20 text-[10px] font-medium mt-2">
                        ↑ ↓ arrow keys · M to mute
                    </p>
                </div>
            </div>

            {/* ── REEL PLAYER (centre, scroll-snap) ─────────────── */}
            <div
                ref={containerRef}
                className="flex-1 reels-scroll-container"
            >

                {/* Initial loading */}
                {loading && (
                    <div className="h-screen flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {reels.map((reel, idx) => (
                    <div
                        key={reel.id}
                        className="h-screen reel-snap-item flex items-center justify-center relative bg-black"
                    >
                        {/* 9:16 card */}
                        <div
                            className="relative h-full overflow-hidden bg-black"
                            style={{ width: 'min(100%, calc(100vh * 9 / 16))' }}
                        >
                            {/* VIDEO */}
                            <video
                                ref={el => { videoRefs.current[idx] = el; }}
                                src={reel.videoUrl}
                                poster={reel.thumbnailUrl}
                                className="w-full h-full object-cover cursor-pointer"
                                loop
                                playsInline
                                muted={muted}
                                onClick={() => togglePlay(idx)}
                            />

                            {/* Gradient: top fade + bottom strong */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            </div>

                            {/* ── TOP BAR (mobile back + title) ── */}
                            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe pt-5 lg:hidden">
                                <button
                                    onClick={() => router.back()}
                                    className="w-9 h-9 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                                <span className="text-white font-black text-sm uppercase tracking-[0.2em] drop-shadow-lg">Reels</span>
                                <div className="w-9" />
                            </div>

                            {/* ── PLAY/PAUSE indicator ── */}
                            {paused[idx] && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-20 h-20 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                                        <svg className="w-9 h-9 text-white fill-current translate-x-1" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* ── BOTTOM INFO ── */}
                            <div className="absolute bottom-0 left-0 right-0 px-5 pb-8">
                                {/* Partner */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-base border-2 border-white/30 flex-shrink-0 shadow-lg">
                                        {reel.user?.firstName?.[0] || 'P'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-black text-sm drop-shadow truncate">
                                            {reel.user?.firstName} {reel.user?.lastName}
                                        </p>
                                        <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider">Property Partner</p>
                                    </div>
                                    <button className="px-3.5 py-1.5 border border-white/50 rounded-full text-white text-xs font-black hover:bg-white/10 transition-all flex-shrink-0 backdrop-blur-sm">
                                        Follow
                                    </button>
                                </div>

                                {reel.title && (
                                    <h3 className="text-white font-black text-lg leading-snug mb-2 drop-shadow-lg">
                                        {reel.title}
                                    </h3>
                                )}
                                {reel.description && (
                                    <p className="text-white/75 text-xs font-medium leading-relaxed line-clamp-2 max-w-xs drop-shadow">
                                        {reel.description}
                                    </p>
                                )}
                            </div>

                            {/* ── MUTE BUTTON ── */}
                            <button
                                onClick={() => setMuted(m => !m)}
                                className="absolute bottom-8 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all border border-white/10"
                            >
                                {muted ? (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Loading more spinner */}
                {!loading && hasMore && (
                    <div className="h-20 flex items-center justify-center bg-black">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                )}

                {/* End of feed */}
                {!hasMore && reels.length > 0 && (
                    <div className="h-32 flex items-center justify-center bg-black">
                        <div className="text-center">
                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">You&apos;ve seen all reels</p>
                            <button
                                onClick={() => scrollTo(0)}
                                className="mt-2 text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors"
                            >
                                ↑ Back to top
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── RIGHT SIDEBAR: Actions + Nav (desktop) ──────── */}
            <div className="hidden lg:flex flex-col items-center justify-end pb-32 gap-5 w-20 flex-shrink-0">
                {/* Up arrow */}
                <button
                    onClick={() => scrollTo(activeIndex - 1)}
                    disabled={activeIndex === 0}
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-default flex items-center justify-center text-white transition-all border border-white/10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                </button>

                {/* Counter */}
                <div className="text-center">
                    <p className="text-white font-black text-sm">{activeIndex + 1}</p>
                    <p className="text-white/30 text-[10px] font-bold">/ {reels.length}</p>
                </div>

                {/* Down arrow */}
                <button
                    onClick={() => scrollTo(activeIndex + 1)}
                    disabled={activeIndex >= reels.length - 1 && !hasMore}
                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-default flex items-center justify-center text-white transition-all border border-white/10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── Page export (Suspense boundary for useSearchParams) ────────────────────
export default function ReelsWatchPage() {
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            </div>
        }>
            <ReelsViewer />
        </Suspense>
    );
}
