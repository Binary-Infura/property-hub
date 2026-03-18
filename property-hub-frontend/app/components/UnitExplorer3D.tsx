'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { unitService, PropertyUnit, UnitStatus } from '@/app/services/unitService';
import { propertyService, Project } from '@/app/services/propertyService';
import { explorerService, SpatialData } from '@/app/services/explorerService';

const UnitCanvas3D = dynamic(() => import('@/app/components/UnitCanvas3D'), { 
    ssr: false,
    loading: () => <LoadingOverlay message="Rendering Scene" />
});

const STATUS_LABEL: Record<UnitStatus, string> = {
    DRAFT: 'Draft',
    RESERVED:  'Reserved',
    BOOKED:    'Booked',
    SOLD:      'Sold',
};

const STATUS_DOT: Record<UnitStatus, string> = {
    DRAFT: 'bg-[#64748b] shadow-[0_0_10px_rgba(100,116,139,0.5)]',
    RESERVED:  'bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.5)]',
    BOOKED:    'bg-[#f97316] shadow-[0_0_10px_rgba(249,115,22,0.5)]',
    SOLD:      'bg-[#f43f5e] shadow-[0_0_10px_rgba(244,63,94,0.5)]',
};

const STATUS_CHIP_STYLES: Record<UnitStatus, string> = {
    DRAFT: 'bg-slate-50 text-slate-700 border-slate-100',
    RESERVED:  'bg-amber-50 text-amber-700 border-amber-100',
    BOOKED:    'bg-orange-50 text-orange-700 border-orange-100',
    SOLD:      'bg-rose-50 text-rose-700 border-rose-100',
};

// ─── Loading Overlay Component ───────────────────────────────────────────────
function LoadingOverlay({ message = 'Loading Explorer' }: { message?: string }) {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#f8fafc]">
            <div className="relative mb-8">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-[6px] border-slate-100 border-t-blue-600 rounded-full shadow-lg"
                />
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg rotate-45 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                </motion.div>
            </div>
            <div className="text-center">
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-900 font-black text-xs uppercase tracking-[0.8em] mb-2"
                >
                    {message}
                </motion.p>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="h-1 bg-slate-100 rounded-full w-48 mx-auto overflow-hidden"
                >
                    <div className="h-full bg-blue-600 w-full animate-[progress_2s_ease-in-out_infinite]" />
                </motion.div>
            </div>
        </div>
    );
}

export default function UnitExplorer3D({ projectId }: { projectId: string }) {
    const [units, setUnits] = useState<PropertyUnit[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<'building' | 'floor'>('building');
    const [selectedFloor, setSelectedFloor] = useState<number>(1);
    const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);
    const [stats, setStats] = useState({ total: 0, draft: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        explorerService.getSpatialData(projectId)
            .then((data: SpatialData) => {
                setUnits(data.units);
                setProject(data.project as any);
                setStats({
                    total: data.stats.totalUnits,
                    draft: data.stats.draftUnits
                });
                
                const floors = ([...new Set(data.units.map((u: PropertyUnit) => u.floor ?? 1))] as number[]).sort((a: number, b: number) => a - b);
                if (floors.length > 0) setSelectedFloor(floors[0] as number);
                
                setTimeout(() => setLoading(false), 800);
            })
            .catch((err) => {
                console.error("Error fetching explorer data:", err);
                setError('Service Unavailable');
                setLoading(false);
            });

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [projectId]);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const floors = useMemo(() => [...new Set(units.map(u => u.floor ?? 1))].sort((a: number, b: number) => a - b), [units]);

    return (
        <div 
            ref={containerRef}
            className={`relative w-full transition-all duration-700 ease-in-out bg-[#f8fafc] overflow-hidden group border border-slate-200 shadow-2xl ${isFullscreen ? 'h-screen' : 'h-[85vh] min-h-[750px] rounded-[5rem]'}`}
        >
            <AnimatePresence>
                {loading && <motion.div key="loader" exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.8, ease: "easeInOut" }} className="absolute inset-0 z-[60]"><LoadingOverlay /></motion.div>}
            </AnimatePresence>

            {/* Soft Light Background Gradient */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,#dbeafe_0%,transparent_50%)]" />
                <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,#ede9fe_0%,transparent_50%)]" />
            </div>

            {/* Cinematic Header - Light Theme */}
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute top-0 left-0 right-0 z-20 p-12 md:p-16 flex flex-col md:flex-row md:items-start justify-between gap-10 pointer-events-none"
            >
                <div className="pointer-events-auto">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="w-16 h-16 bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2rem] flex items-center justify-center shadow-xl ring-1 ring-slate-100">
                            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none flex items-center gap-3">
                                SPATIAL <span className="text-blue-600 italic">EXPLORER</span>
                            </h3>
                            <p className="text-slate-400 font-black uppercase text-[11px] tracking-[0.5em] mt-3">Architectural Precision • Ver 3.2</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-2 flex gap-2 shadow-xl ring-1 ring-slate-100">
                        {(['building', 'floor'] as const).map(mode => (
                            <button 
                                key={mode} 
                                onClick={() => { setViewMode(mode); setSelectedUnit(null); }} 
                                className={`px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${viewMode === mode ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={toggleFullscreen}
                        className="w-16 h-16 bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[2rem] flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all ring-1 ring-slate-100 shadow-xl group/fs"
                    >
                        {isFullscreen ? (
                             <svg className="w-6 h-6 group-hover/fs:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4.5 4.5M9 9V4.5M9 9H4.5M15 9L19.5 4.5M15 9V4.5M15 9H19.5M9 15L4.5 19.5M9 15V19.5M9 15H4.5M15 15L19.5 19.5M15 15V19.5M15 15H19.5" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 group-hover/fs:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                            </svg>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* 3D Model Mounting Point */}
            {!loading && !error && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute inset-0 z-10 antialiased"
                >
                    <UnitCanvas3D 
                        units={units} 
                        projectType={project?.projectType || 'APARTMENT'}
                        projectName={project?.name}
                        selectedId={selectedUnit?.id || null}
                        onUnitClick={u => setSelectedUnit(u)} 
                        viewMode={viewMode} 
                        selectedFloor={selectedFloor} 
                    />
                </motion.div>
            )}

            {error && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-50">
                    <p className="text-rose-500 font-black uppercase text-xl tracking-[0.5em]">{error}</p>
                </div>
            )}

            {/* Left Control Deck - Light Mode */}
            {!loading && !error && units.length > 0 && (
                <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="absolute left-10 bottom-10 z-20 w-[380px] flex flex-col gap-6 pointer-events-none"
                >
                    {/* Floor Navigation */}
                    {viewMode === 'floor' && (
                        <div className="pointer-events-auto bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[3rem] p-6 shadow-2xl ring-1 ring-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-5 text-center">Vertical Sync • Level</p>
                             <div className="flex flex-wrap gap-2 justify-center">
                                {floors.map(f => (
                                    <button 
                                        key={f} 
                                        onClick={() => { setSelectedFloor(f); setSelectedUnit(null); }} 
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-300 border ${selectedFloor === f ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-110' : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stats & Legend Overlay */}
                    <div className="pointer-events-auto bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[3.5rem] p-10 space-y-8 shadow-2xl ring-1 ring-slate-100 group-hover:bg-white/95 transition-all duration-700">
                       <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Total Units</p>
                                <p className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">{stats.total}</p>
                            </div>
                            <div className="w-px h-12 bg-slate-200 mx-4" />
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Drafts</p>
                                <p className="text-5xl font-black text-slate-600 tracking-tighter italic leading-none">{stats.draft}</p>
                            </div>
                       </div>

                       <div className="grid grid-cols-2 gap-y-5 gap-x-8 pt-6 border-t border-slate-100">
                            {Object.entries(STATUS_LABEL).map(([id, label]) => (
                                <div key={id} className="flex items-center gap-3 group/item">
                                    <div className={`w-3 h-3 rounded-full transition-transform duration-500 group-hover/item:scale-125 ${STATUS_DOT[id as UnitStatus]}`} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover/item:text-slate-900 transition-colors">{label}</span>
                                </div>
                            ))}
                       </div>
                    </div>
                </motion.div>
            )}

            {/* Right Side Detail Panel */}
            <AnimatePresence>
                {selectedUnit && (
                    <motion.div 
                        initial={{ x: 500, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 500, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute right-10 bottom-10 top-10 w-[460px] z-30 pointer-events-none"
                    >
                        <div className="h-full pointer-events-auto bg-white/90 backdrop-blur-[40px] border border-slate-200 rounded-[4rem] shadow-[0_20px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden ring-1 ring-white">
                            {/* Detail Header */}
                            <div className="relative group/header overflow-hidden">
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <img 
                                        src={project?.projectType === 'VILLA' 
                                            ? "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"
                                            : "https://images.unsplash.com/photo-1545324418-f1d3c5b5a291?auto=format&fit=crop&q=80&w=800"} 
                                        alt="Property Preview" 
                                        className="w-full h-full object-cover opacity-30 group-hover/header:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc]/50 to-[#f8fafc]" />
                                </div>
                                <div className="relative z-10 p-12 pb-10 flex items-start justify-between border-b border-slate-100">
                                    <div>
                                        <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.6em] mb-4">Object Identity</p>
                                        <h4 className="text-7xl font-black text-slate-900 tracking-tighter italic leading-[0.8]">#{selectedUnit.unitNumber}</h4>
                                    </div>
                                    <button onClick={() => setSelectedUnit(null)} className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-white hover:border-rose-500 transition-all active:scale-90 shadow-sm group/close">
                                        <svg className="w-6 h-6 group-hover/close:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Scanner Content */}
                            <div className="p-12 pt-10 flex-1 overflow-y-auto space-y-6 no-scrollbar">
                                <div className="flex justify-center">
                                    <div className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4 border ${STATUS_CHIP_STYLES[selectedUnit.status]}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[selectedUnit.status]}`} />
                                        {selectedUnit.status} Listing
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5">
                                    {[
                                        { k: 'Market Valuation', v: `₹${(selectedUnit.price / 100000).toFixed(2)}L`, i: '💰', l: 'Premium Estimate' },
                                        { k: 'Carpet Area', v: selectedUnit.area != null ? `${selectedUnit.area} SQFT` : 'TBD', i: '📐', l: 'Spatial Specs' },
                                        { k: 'Level & Position', v: selectedUnit.floor != null ? `Floor ${selectedUnit.floor}` : 'Base', i: '📍', l: 'Vertical Identity' },
                                        { k: 'Design Config', v: selectedUnit.type || 'Signature', i: '🏢', l: 'Architectural' },
                                    ].map((spec, i) => (
                                        <div key={i} className="group p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:bg-white transition-all duration-300 hover:shadow-lg">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-500">{spec.i}</div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5">{spec.k}</p>
                                                    <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{spec.v}</p>
                                                    <p className="text-[9px] font-black text-blue-500/40 uppercase tracking-[0.2em]">{spec.l}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Acquisition CTA */}
                            <div className="p-12 pt-0">
                                <button className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-500/20">
                                    Initiate Acquisition
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HUD Footer Overlay */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 2 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none"
            >
                <div className="flex gap-12 mb-5">
                    {[1, 2, 3, 4, 1, 2, 3, 4].map((_, i) => (
                        <div key={i} className="w-0.5 h-2.5 bg-slate-300 skew-x-12" />
                    ))}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[1.5em]">PropertyHub Spatial Engine</p>
            </motion.div>
        </div>
    );
}

// ─── Keyframe Animations ───────────────────────────────────────────────────
const styleTag = typeof document !== 'undefined' ? document.createElement('style') : null;
if (styleTag) {
    styleTag.innerHTML = `
        @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(styleTag);
}
