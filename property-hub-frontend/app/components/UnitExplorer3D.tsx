'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { UnitStatus } from '@/app/services/unitService';
import { explorerService, ProjectSummary, TowerSummary, Tower, SlimUnit, UnitDetail } from '@/app/services/explorerService';

const UnitCanvas3D = dynamic(() => import('@/app/components/UnitCanvas3D'), {
    ssr: false,
    loading: () => <LoadingOverlay message="Rendering Scene" />,
});

const STATUS_LABEL: Record<UnitStatus, string> = {
    AVAILABLE: 'Available',
    RESERVED: 'Reserved',
    BOOKED:   'Booked',
    SOLD:     'Sold',
};

const STATUS_DOT: Record<UnitStatus, string> = {
    AVAILABLE: 'bg-[#64748b] shadow-[0_0_10px_rgba(100,116,139,0.5)]',
    RESERVED: 'bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.5)]',
    BOOKED:   'bg-[#f97316] shadow-[0_0_10px_rgba(249,115,22,0.5)]',
    SOLD:     'bg-[#f43f5e] shadow-[0_0_10px_rgba(244,63,94,0.5)]',
};

const STATUS_CHIP_STYLES: Record<UnitStatus, string> = {
    AVAILABLE: 'bg-slate-50 text-slate-700 border-slate-100',
    RESERVED: 'bg-amber-50 text-amber-700 border-amber-100',
    BOOKED:   'bg-orange-50 text-orange-700 border-orange-100',
    SOLD:     'bg-rose-50 text-rose-700 border-rose-100',
};

// ─── Loading Overlay ─────────────────────────────────────────────────────────
function LoadingOverlay({ message = 'Loading Explorer' }: { message?: string }) {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#f8fafc]">
            <div className="relative mb-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-24 h-24 border-[6px] border-slate-100 border-t-blue-600 rounded-full shadow-lg"
                />
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
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
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: 'easeInOut' }}
                    className="h-1 bg-slate-100 rounded-full w-48 mx-auto overflow-hidden"
                >
                    <div className="h-full bg-blue-600 w-full animate-[progress_2s_ease-in-out_infinite]" />
                </motion.div>
            </div>
        </div>
    );
}

// ─── Tower Card ───────────────────────────────────────────────────────────────
function TowerCard({
    tower,
    isSelected,
    onClick,
}: {
    tower: TowerSummary;
    isSelected: boolean;
    onClick: () => void;
}) {
    const { total, AVAILABLE: available, RESERVED: reserved, BOOKED: booked, SOLD: sold } = tower.unitCounts;

    return (
        <button
            onClick={onClick}
            className={`
                w-full text-left p-4 rounded-3xl border transition-all duration-300
                ${isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-200/50 scale-[1.02]'
                    : 'bg-white/80 border-slate-200 text-slate-900 hover:bg-white hover:scale-[1.01]'}
                backdrop-blur-xl ring-1 ${isSelected ? 'ring-blue-400' : 'ring-slate-100'}
            `}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-blue-50'}`}>
                        <svg className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <p className={`text-[8px] font-black uppercase tracking-[0.3em] mb-0 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>Block</p>
                        <p className="text-sm font-black tracking-tight">{tower.name}</p>
                    </div>
                </div>
                {tower.totalFloors && (
                    <div className={`px-2 py-1 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-50 border border-slate-100'}`}>
                        <p className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-700'}`}>{tower.totalFloors}F</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                    <p className={`text-xl font-black tracking-tighter ${isSelected ? 'text-white' : 'text-slate-900'}`}>{total}</p>
                    <p className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>Units</p>
                </div>
                
                <div className="flex gap-1">
                    {[
                        { val: available, color: 'bg-slate-400' },
                        { val: reserved, color: 'bg-amber-400' },
                        { val: booked,   color: 'bg-orange-400' },
                        { val: sold,     color: 'bg-rose-400' }
                    ].filter(s => s.val > 0).map((s, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${s.color} ${isSelected ? 'ring-1 ring-white/30' : ''}`} />
                    ))}
                </div>
            </div>
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UnitExplorer3D({ projectId, mainImage }: { projectId: string; mainImage?: string }) {
    const [summary,       setSummary]       = useState<ProjectSummary | null>(null);
    const [selectedTowerIds, setSelectedTowerIds] = useState<string[]>([]);
    const [towers3D,      setTowers3D]      = useState<Tower[]>([]);
    const [loading,       setLoading]       = useState(true);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [unitDetail,    setUnitDetail]    = useState<UnitDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error,         setError]         = useState('');
    const [viewMode,      setViewMode]      = useState<'building' | 'floor'>('building');
    const [selectedFloor, setSelectedFloor] = useState<number>(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // ── Fetch lightweight summary once on mount ───────────────────────────
    useEffect(() => {
        explorerService.getProjectSummary(projectId)
            .then((data: ProjectSummary) => {
                setSummary(data);

                // Default: select ALL towers
                if (data.towers.length > 0) {
                    const allIds = data.towers.map(t => t.id);
                    setSelectedTowerIds(allIds);
                    setTowers3D(data.towers.map(t => toTower3D(t, projectId)));
                    
                    // Initial floor from first tower's slim units
                    const firstT = data.towers[0];
                    const floors = getFloors(firstT.units);
                    if (floors.length > 0) setSelectedFloor(floors[0]);
                }

                setTimeout(() => setLoading(false), 600);
            })
            .catch(err => {
                console.error('Error fetching explorer summary:', err);
                setError('Service Unavailable');
                setLoading(false);
            });

        const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFSChange);
        return () => document.removeEventListener('fullscreenchange', onFSChange);
    }, [projectId]);

    // ── When a unit is clicked, fetch its full details ────────────────────
    const handleUnitClick = useCallback(async (unitId: string) => {
        if (unitId === selectedUnitId) return; // already selected
        setSelectedUnitId(unitId);
        setUnitDetail(null);
        setDetailLoading(true);
        try {
            const detail = await explorerService.getUnitDetail(projectId, unitId);
            setUnitDetail(detail);
        } catch (err) {
            console.error('Failed to load unit detail:', err);
        } finally {
            setDetailLoading(false);
        }
    }, [projectId, selectedUnitId]);

    const handleTowerSelect = useCallback((tower: TowerSummary) => {
        setSelectedTowerIds(prev => {
            const isAlreadySelected = prev.includes(tower.id);
            let next: string[];
            if (isAlreadySelected) {
                // Remove, but don't allow zero selection (optional, but better for UX)
                if (prev.length === 1) return prev;
                next = prev.filter(id => id !== tower.id);
            } else {
                next = [...prev, tower.id];
            }
            
            // Sync with 3D towers array
            if (summary) {
                setTowers3D(summary.towers.filter(t => next.includes(t.id)).map(t => toTower3D(t, projectId)));
            }
            
            return next;
        });
        
        setSelectedUnitId(null);
        setUnitDetail(null);
    }, [summary, projectId]);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen();
        }
    };

    // Slim units currently shown in the 3D canvas (concatenated from all selected towers)
    const currentUnits: SlimUnit[] = useMemo(() => {
        if (!summary) return [];
        return summary.towers
            .filter(t => selectedTowerIds.includes(t.id))
            .flatMap(t => t.units);
    }, [summary, selectedTowerIds]);

    const floors = useMemo(
        () => getFloors(currentUnits),
        [currentUnits],
    );


    const stats = summary?.stats ?? {
        totalUnits: 0, availableUnits: 0, reservedUnits: 0, bookedUnits: 0, soldUnits: 0,
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full transition-all duration-700 ease-in-out bg-[#f8fafc] overflow-hidden group border border-slate-200 shadow-2xl ${isFullscreen ? 'h-screen' : 'h-[85vh] min-h-[750px] rounded-[5rem]'}`}
        >
            <AnimatePresence>
                {loading && (
                    <motion.div
                        key="loader"
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                        className="absolute inset-0 z-[60]"
                    >
                        <LoadingOverlay />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background gradients */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,#dbeafe_0%,transparent_50%)]" />
                <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,#ede9fe_0%,transparent_50%)]" />
            </div>

            {/* ── Top header ─────────────────────────────────────────── */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute top-0 left-0 right-0 z-20 p-8 md:p-10 flex flex-col md:flex-row md:items-start justify-between gap-6 pointer-events-none"
            >
                <div className="pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-slate-100">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none flex items-center gap-2">
                                SPATIAL <span className="text-blue-600 italic">EXPLORER</span>
                            </h3>
                            <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.4em] mt-2">
                                Architectural Precision
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pointer-events-auto">
                    {currentUnits.length > 0 && (
                        <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-[1.8rem] p-1.5 flex gap-1 shadow-lg ring-1 ring-slate-100">
                            {(['building', 'floor'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => { setViewMode(mode); setSelectedUnitId(null); setUnitDetail(null); }}
                                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-500 ${viewMode === mode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={toggleFullscreen}
                        className="w-12 h-12 bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all ring-1 ring-slate-100 shadow-lg group/fs"
                    >
                        {isFullscreen ? (
                            <svg className="w-5 h-5 group-hover/fs:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4.5 4.5M9 9V4.5M9 9H4.5M15 9L19.5 4.5M15 9V4.5M15 9H19.5M9 15L4.5 19.5M9 15V19.5M9 15H4.5M15 15L19.5 19.5M15 15V19.5M15 15H19.5" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 group-hover/fs:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                            </svg>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* ── 3D Canvas — renders with slim units ───────────────── */}
            {!loading && !error && currentUnits.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="absolute inset-0 z-10 antialiased"
                >
                    <UnitCanvas3D
                        units={currentUnits}
                        towers={towers3D}
                        projectType={(summary?.project.projectType as any) || 'APARTMENT'}
                        projectName={summary?.project.name}
                        selectedId={selectedUnitId}
                        onUnitClick={handleUnitClick}
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

            {/* ── Left control deck ─────────────────────────────────── */}
            {!loading && !error && (
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.8 }}
                    className="absolute left-8 bottom-8 z-20 w-[280px] flex flex-col gap-3 pointer-events-none"
                >
                    {/* Floor navigation */}
                    {viewMode === 'floor' && floors.length > 0 && (
                        <div className="pointer-events-auto bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-3xl p-4 shadow-xl ring-1 ring-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 text-center">Vertical Engine • Lvl</p>
                            <div className="flex flex-wrap gap-1.5 justify-center">
                                {floors.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => { setSelectedFloor(f); setSelectedUnitId(null); setUnitDetail(null); }}
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all duration-300 border pointer-events-auto ${selectedFloor === f ? 'bg-blue-600 border-blue-500 text-white shadow-md scale-105' : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Project stats */}
                    <div className="pointer-events-auto bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-3xl p-6 shadow-xl ring-1 ring-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Units</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stats.totalUnits}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200 mx-2" />
                            <div className="space-y-0.5 text-right">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Blocks</p>
                                <p className="text-3xl font-black text-slate-600 tracking-tighter leading-none">{summary?.towers.length ?? 0}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-slate-50">
                            {Object.entries(STATUS_LABEL).map(([id, label]) => (
                                <div key={id} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${STATUS_DOT[id as UnitStatus]}`} />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tower selector cards */}
                    {summary && summary.towers.length > 0 && (
                        <div className="pointer-events-auto space-y-2">
                            <div className="flex items-center justify-between px-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Select Blocks</p>
                                <button 
                                    onClick={() => {
                                        const allIds = summary.towers.map(t => t.id);
                                        const isAllSelected = selectedTowerIds.length === allIds.length;
                                        const next = isAllSelected ? [allIds[0]] : allIds;
                                        setSelectedTowerIds(next);
                                        setTowers3D(summary.towers.filter(t => next.includes(t.id)).map(t => toTower3D(t, projectId)));
                                    }}
                                    className="text-[9px] font-black text-blue-600 uppercase tracking-[0.1em] hover:text-blue-700 transition-colors"
                                >
                                    {selectedTowerIds.length === summary.towers.length ? 'Clear All' : 'Select All'}
                                </button>
                            </div>
                            {summary.towers.map(tower => (
                                <TowerCard
                                    key={tower.id}
                                    tower={tower}
                                    isSelected={selectedTowerIds.includes(tower.id)}
                                    onClick={() => handleTowerSelect(tower)}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* ── Right detail panel — shown after unit click ──────── */}
            <AnimatePresence>
                {(selectedUnitId) && (
                    <motion.div
                        initial={{ x: 500, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 500, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute right-8 bottom-8 top-8 w-[400px] z-30 pointer-events-none"
                    >
                        <div className="h-full pointer-events-auto bg-white/95 backdrop-blur-3xl border border-slate-200 rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden ring-1 ring-white">
                            {/* Header */}
                            <div className="relative group/header overflow-hidden">
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <img
                                        src={mainImage || (summary?.project.projectType === 'VILLA'
                                            ? '/external-assets/worli_sky_villa.png'
                                            : '/external-assets/prestige_falcon_city.png')}
                                        alt="Property Preview"
                                        className="w-full h-48 object-cover opacity-20 group-hover/header:scale-105 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white" />
                                </div>
                                <div className="relative z-10 p-10 pb-6 flex items-start justify-between border-b border-slate-50">
                                    <div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2 text-shadow-sm">Object Identity</p>
                                        {detailLoading ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Loading…</p>
                                            </div>
                                        ) : (
                                            <h4 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">
                                                #{unitDetail?.unitNumber ?? '—'}
                                            </h4>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => { setSelectedUnitId(null); setUnitDetail(null); }}
                                        className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-90 shadow-sm group/close"
                                    >
                                        <svg className="w-5 h-5 group-hover/close:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content — shown only once detail is loaded */}
                            {unitDetail && !detailLoading && (
                                <>
                                    <div className="p-10 pt-6 flex-1 overflow-y-auto space-y-4 no-scrollbar">
                                        <div className="flex justify-start">
                                            <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-3 border ${STATUS_CHIP_STYLES[unitDetail.status]}`}>
                                                <div className={`w-2 h-2 rounded-full ${STATUS_DOT[unitDetail.status]}`} />
                                                {unitDetail.status} Listing
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { k: 'Market Valuation', v: `₹${(unitDetail.price / 100000).toFixed(2)}L`,                                   i: '💰' },
                                                { k: 'Carpet Area',      v: unitDetail.area      != null ? `${unitDetail.area} SQFT` : 'TBD',                 i: '📐' },
                                                { k: 'Level & Position', v: unitDetail.floor     != null ? `Floor ${unitDetail.floor}` : 'Base',              i: '📍' },
                                                { k: 'Design Config',    v: unitDetail.type      || 'N/A',                                                     i: '🏢' },
                                                ...(unitDetail.tower ? [{ k: 'Tower',            v: unitDetail.tower.name,                                     i: '🏗️' }] : []),
                                            ].map((spec, i) => (
                                                <div key={i} className="group p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white transition-all duration-300">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">{spec.i}</div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{spec.k}</p>
                                                            <p className="text-lg font-black text-slate-900 tracking-tight leading-none">{spec.v}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-10 pt-0">
                                        <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20">
                                            Initiate Acquisition
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HUD footer */}
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toTower3D(tower: TowerSummary, projectId: string): Tower {
    return {
        id:          tower.id,
        name:        tower.name,
        projectId,
        totalFloors: tower.totalFloors,
        createdAt:   tower.createdAt,
        updatedAt:   tower.updatedAt,
    };
}

function getFloors(units: SlimUnit[]): number[] {
    return [...new Set(units.map(u => u.floor ?? 1))].sort((a, b) => a - b);
}

// ─── Keyframe Animations ─────────────────────────────────────────────────────
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
