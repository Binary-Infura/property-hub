'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { projectLoansService, ProjectLoanApplication, ReviewStatus, BankStatus } from '@/app/services/loanService';
import SidebarIcon from '@/app/components/SidebarIcon';
import Link from 'next/link';

// ─── Status Config ────────────────────────────────────────────────────────────

const REVIEW_CONFIG: Record<ReviewStatus, { label: string; color: string; bg: string; border: string }> = {
    PENDING:     { label: 'Pending Review',  color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    IN_PROGRESS: { label: 'In Progress',    color: 'text-blue-700',  bg: 'bg-blue-50',  border: 'border-blue-200' },
    COMPLETED:   { label: 'Completed',       color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

const BANK_STATUS_CONFIG: Record<BankStatus, { label: string; color: string; bg: string; icon: string; border: string }> = {
    APPROVED:      { label: 'Bank Approved',   color: 'text-emerald-700', bg: 'bg-emerald-50', icon: '✅', border: 'border-emerald-100' },
    LIMITED:       { label: 'Limited Approval', color: 'text-amber-700',  bg: 'bg-amber-50', icon: '⚠️', border: 'border-amber-100' },
    NOT_AVAILABLE: { label: 'Not Available',   color: 'text-rose-700',   bg: 'bg-rose-50', icon: '❌', border: 'border-rose-100' },
};

function ReviewBadge({ status }: { status: ReviewStatus }) {
    const cfg = REVIEW_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border} text-[10px] font-bold uppercase tracking-wider`}>
            {cfg.label}
        </span>
    );
}

function BankStatusBadge({ status }: { status: BankStatus }) {
    const cfg = BANK_STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.color} ${cfg.border} text-[11px] font-black uppercase tracking-tight`}>
            <span className="text-sm">{cfg.icon}</span> {cfg.label}
        </span>
    );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ app, token, onClose, onUpdate }: {
    app: ProjectLoanApplication;
    token: string;
    onClose: () => void;
    onUpdate: (updated: ProjectLoanApplication) => void;
}) {
    const [remarks, setRemarks] = useState(app.remarks || '');
    const [updating, setUpdating] = useState(false);

    async function handleUpdate(patch: { reviewStatus?: ReviewStatus; bankStatus?: BankStatus }) {
        setUpdating(true);
        try {
            const updated = await projectLoansService.updateReview(token, app.id, { ...patch, remarks });
            onUpdate(updated);
        } catch {
            alert('Failed to update');
        } finally {
            setUpdating(false);
        }
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200" 
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                            <SidebarIcon name="bank" className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">Bank Eligibility Review</div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-none">{app.project.name}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Status Overview */}
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px] bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Review Progress</p>
                           <ReviewBadge status={app.reviewStatus} />
                        </div>
                        <div className="flex-1 min-w-[200px] bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Current Decision</p>
                           <BankStatusBadge status={app.bankStatus} />
                        </div>
                    </div>

                    {/* Bank Info Section */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 mb-3 opacity-80">Assigned Bank Partner</p>
                            <h3 className="text-3xl font-extrabold tracking-tight">{app.bank.name}</h3>
                            <div className="mt-4 flex items-center gap-6">
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex-1">
                                    <p className="text-[10px] font-bold text-blue-100 uppercase opacity-70">Rate Benchmark</p>
                                    <p className="text-xl font-black">{app.bank.percentage}%</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-bold text-blue-100 uppercase opacity-70">Location</p>
                                    <p className="text-sm font-bold truncate">{app.project.addressRecord?.city?.name || 'All India'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Builder & Documents */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {app.project.onboardedBy && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Builder Contact</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                                        {app.project.onboardedBy.firstName[0]}{app.project.onboardedBy.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 leading-none">{app.project.onboardedBy.firstName} {app.project.onboardedBy.lastName}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-1">{app.project.onboardedBy.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Verification Files</p>
                           <div className="space-y-2">
                               {app.documents.length === 0 ? (
                                   <p className="text-xs text-gray-400 font-medium italic">No legal docs linked</p>
                               ) : (
                                   app.documents.slice(0, 3).map(doc => (
                                       <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group">
                                           <span className="text-[11px] font-bold text-gray-700 truncate">{doc.name}</span>
                                           <svg className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                       </a>
                                   ))
                               )}
                           </div>
                        </div>
                    </div>

                    {/* Decision Actions */}
                    <div className="space-y-6 pt-4 border-t border-gray-50">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Review Remarks</p>
                            <textarea
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px] transition-all"
                                placeholder="Add eligibility comments, bank LTV ratios, or notes for the builder..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mark Progress</p>
                                <div className="flex flex-col gap-2">
                                    {(['IN_PROGRESS', 'COMPLETED'] as ReviewStatus[]).map(s => {
                                        const cfg = REVIEW_CONFIG[s];
                                        const active = app.reviewStatus === s;
                                        return (
                                            <button 
                                                key={s} 
                                                disabled={updating || active} 
                                                onClick={() => handleUpdate({ reviewStatus: s })}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                                                    active ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'
                                                } text-xs font-black uppercase tracking-widest`}
                                            >
                                                {cfg.label} {active && '✓'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Eligibility Decision</p>
                                <div className="flex flex-col gap-2">
                                    {(['APPROVED', 'LIMITED', 'NOT_AVAILABLE'] as BankStatus[]).map(s => {
                                        const cfg = BANK_STATUS_CONFIG[s];
                                        const active = app.bankStatus === s;
                                        return (
                                            <button 
                                                key={s} 
                                                disabled={updating || active} 
                                                onClick={() => handleUpdate({ bankStatus: s })}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                                                    active ? `${cfg.bg} ${cfg.border} ${cfg.color}` : 'bg-white border-gray-50 text-gray-400 hover:border-gray-200'
                                                } text-xs font-black uppercase tracking-widest`}
                                            >
                                                <span>{cfg.icon} {cfg.label}</span> {active && '✓'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectLoansPage() {
    const { token } = useAuth();
    const [apps, setApps] = useState<ProjectLoanApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<ProjectLoanApplication | null>(null);
    const [filterBank, setFilterBank] = useState<string>('ALL');
    const [filterReview, setFilterReview] = useState<ReviewStatus | 'ALL'>('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        projectLoansService.getAll(token)
            .then(setApps)
            .catch(() => setApps([]))
            .finally(() => setLoading(false));
    }, [token]);

    const uniqueBanks = Array.from(new Map(apps.map(a => [a.bank.id, a.bank])).values());

    const filtered = apps.filter(a => {
        const matchBank = filterBank === 'ALL' || a.bank.id === filterBank;
        const matchReview = filterReview === 'ALL' || a.reviewStatus === filterReview;
        const matchSearch = !search ||
            a.project.name.toLowerCase().includes(search.toLowerCase()) ||
            a.bank.name.toLowerCase().includes(search.toLowerCase()) ||
            (a.project.addressRecord?.city?.name || '').toLowerCase().includes(search.toLowerCase());
        return matchBank && matchReview && matchSearch;
    });

    const stats = {
        total: apps.length,
        pending: apps.filter(a => a.reviewStatus === 'PENDING').length,
        inProgress: apps.filter(a => a.reviewStatus === 'IN_PROGRESS').length,
        approved: apps.filter(a => a.bankStatus === 'APPROVED').length,
    };

    function handleUpdate(updated: ProjectLoanApplication) {
        setApps(prev => prev.map(a => a.id === updated.id ? updated : a));
        setSelected(updated);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Link href="/dashboard" className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Flow 02: Project Eligibility</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Project Bank Tie-ups</h1>
                    <p className="text-gray-500 mt-1 font-medium">Review and verify collective bank eligibility for construction projects</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                   {[
                        { label: 'Assigned Projects', value: stats.total, color: 'text-gray-900', bg: 'bg-white', icon: 'building' },
                        { label: 'Unreviewed', value: stats.pending, color: 'text-amber-600', bg: 'bg-white', icon: 'clip' },
                        { label: 'Audit In-Progress', value: stats.inProgress, color: 'text-blue-600', bg: 'bg-white', icon: 'note' },
                        { label: 'Active Tie-ups', value: stats.approved, color: 'text-emerald-600', bg: 'bg-white', icon: 'bank' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                <div className={`w-8 h-8 rounded-lg ${stat.color.replace('text', 'bg')}/10 flex items-center justify-center ${stat.color}`}>
                                    <SidebarIcon name={stat.icon as any} className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-4xl font-extrabold text-gray-900 leading-none tracking-tight">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Pre-approved projects banner */}
                {apps.filter(a => a.bankStatus === 'APPROVED').length > 0 && (
                    <div className="mb-10 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-[2.5rem] p-1 shadow-lg shadow-emerald-100 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
                        <div className="bg-white/5 backdrop-blur-3xl rounded-[2.3rem] p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white text-3xl shadow-2xl border border-white/20">
                                    🏦
                                </div>
                                <div className="text-white">
                                    <h3 className="text-2xl font-black tracking-tight leading-tight">Fast-Track Loan Processing Enabled</h3>
                                    <p className="text-emerald-50 font-bold opacity-80 mt-1 uppercase tracking-widest text-[10px]">
                                        {apps.filter(a => a.bankStatus === 'APPROVED').length} Approved Projects available for immediate buyer lending
                                    </p>
                                </div>
                            </div>
                            <button className="bg-white text-emerald-700 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:scale-105 active:scale-95 transition-all">
                                View Pre-Approved
                            </button>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative group">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find project, bank partner or city..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <select
                            value={filterReview}
                            onChange={e => setFilterReview(e.target.value as ReviewStatus | 'ALL')}
                            className="flex-1 md:w-48 bg-white border border-gray-200 rounded-2xl px-4 py-4 text-[11px] font-black uppercase tracking-widest text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none shadow-sm cursor-pointer"
                        >
                            <option value="ALL">All Reviews</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                        <select
                            value={filterBank}
                            onChange={e => setFilterBank(e.target.value)}
                            className="flex-1 md:w-48 bg-white border border-gray-200 rounded-2xl px-4 py-4 text-[11px] font-black uppercase tracking-widest text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none shadow-sm cursor-pointer"
                        >
                            <option value="ALL">All Banks</option>
                            {uniqueBanks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* List Grid */}
                {loading ? (
                    <div className="py-32 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-[6px] border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono">Syncing Database...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-gray-200 px-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-gray-300">
                            <SidebarIcon name="bank" className="w-12 h-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">No Review Files Founders</h3>
                        <p className="text-gray-500 mt-2 font-medium max-w-sm mx-auto">Either you are caught up on all reviews or no applications match your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(app => (
                            <div 
                                key={app.id} 
                                onClick={() => setSelected(app)} 
                                className="group bg-white rounded-[2rem] p-4 lg:p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                            >
                                {/* Background design element */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500" />
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex-1 mr-4">
                                            <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-1">{app.project.name}</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                                {app.project.projectType} · {app.project.addressRecord?.city?.name || 'In-City'}
                                            </p>
                                        </div>
                                        <ReviewBadge status={app.reviewStatus} />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 group-hover:bg-blue-50/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">🏦</div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-800 leading-none">{app.bank.name}</p>
                                                    <p className="text-[10px] font-bold text-blue-500 mt-0.5 uppercase tracking-wider">{app.bank.percentage}% Interest</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between px-1">
                                            <BankStatusBadge status={app.bankStatus} />
                                            {app.project.onboardedBy && (
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Contact</p>
                                                    <p className="text-[10px] font-bold text-gray-700">{app.project.onboardedBy.firstName} {app.project.onboardedBy.lastName?.[0]}.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {app.remarks && (
                                        <div className="mt-5 p-3 bg-amber-50/50 rounded-xl border border-amber-50 flex gap-2 items-start">
                                            <span className="text-xs">💬</span>
                                            <p className="text-[10px] font-medium text-amber-800 line-clamp-2 italic">{app.remarks}</p>
                                        </div>
                                    )}
                                    
                                    <div className="mt-6 flex items-center justify-center py-2 bg-gray-50 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        Open Case File
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            {selected && token && (
                <DetailPanel
                    app={selected}
                    token={token}
                    onClose={() => setSelected(null)}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
}
