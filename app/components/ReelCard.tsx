'use client';

import React from 'react';
import Link from 'next/link';
import { Reel } from '../services/reelService';

interface ReelCardProps {
    reel: Reel;
}

export default function ReelCard({ reel }: ReelCardProps) {
    return (
        <Link
            href={`/reels/watch?id=${reel.id}`}
            className="block relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl group border border-gray-800 cursor-pointer"
        >
            {/* Thumbnail / silent preview video */}
            <video
                src={reel.videoUrl}
                poster={reel.thumbnailUrl}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                muted
                playsInline
                preload="none"
                // subtle hover preview
                onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play().catch(() => { })}
                onMouseLeave={e => {
                    const v = e.currentTarget as HTMLVideoElement;
                    v.pause();
                    v.currentTime = 0;
                }}
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

            {/* Play button — visible on hover */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-2xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                    <svg className="w-8 h-8 text-white fill-current translate-x-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>

            {/* "WATCH" pill on hover */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-10">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/20 shadow-xl">
                    Tap to Watch
                </span>
            </div>

            {/* Project Badge — Always visible if exists */}
            {reel.project && (
                <div className="absolute top-3 left-3 z-10">
                    <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-white/20 shadow-lg">
                        {reel.project.name}
                    </span>
                </div>
            )}

            {/* Bottom info */}
            <div className="absolute inset-x-0 bottom-0 p-4 pointer-events-none">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black border-2 border-white/20 flex-shrink-0">
                        {reel.user?.firstName?.[0] || 'P'}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-white text-[11px] font-black leading-tight truncate drop-shadow">
                            {reel.user?.firstName} {reel.user?.lastName}
                        </span>
                        <span className="text-white/50 text-[9px] uppercase font-bold tracking-wider">Property Partner</span>
                    </div>
                </div>

                {reel.title && (
                    <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow-lg">{reel.title}</h3>
                )}
                {reel.description && (
                    <p className="text-white/70 text-[10px] font-medium leading-relaxed line-clamp-1 mt-1 drop-shadow">{reel.description}</p>
                )}
            </div>
        </Link>
    );
}
