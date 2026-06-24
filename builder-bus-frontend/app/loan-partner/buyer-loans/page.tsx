'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { buyerLoansService, BuyerLoanApplication, BuyerLoanStatus } from '@/app/services/loanService';
import SidebarIcon from '@/app/components/SidebarIcon';
import Link from 'next/link';

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BuyerLoanStatus, { label: string; color: string; bg: string; border: string }> = {
    NEW:          { label: 'New',          color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    DOC_PENDING:  { label: 'Doc Pending',  color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-100' },
    UNDER_REVIEW: { label: 'Under Review', color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-100' },
    APPROVED:     { label: 'Approved',     color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    REJECTED:     { label: 'Rejected',     color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-100' },
};

const STATUS_ORDER: BuyerLoanStatus[] = ['NEW', 'DOC_PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

function StatusBadge({ status }: { status: BuyerLoanStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border} text-[10px] font-bold uppercase tracking-wider`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace('text', 'bg')}`} />
            {cfg.label}
        </span>
    );
}

function formatAmount(amount: number | null | undefined) {
    if (!amount) return '—';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ loan, token, onClose, onStatusUpdate }: {
    loan: BuyerLoanApplication;
    token: string;
    onClose: () => void;
    onStatusUpdate: (updated: BuyerLoanApplication) => void;
}) {
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusNotes, setStatusNotes] = useState(loan.notes || '');

    async function handleStatusChange(status: BuyerLoanStatus) {
        setUpdatingStatus(true);
        try {
            const updated = await buyerLoansService.updateStatus(token, loan.id, status, statusNotes);
            onStatusUpdate(updated);
        } catch (e) {
            alert('Failed to update status');
        } finally {
            setUpdatingStatus(false);
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
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner">
                            {loan.lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">Application Details</div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-none">{loan.lead.name}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Status & Project Section */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Current Status</p>
                           <StatusBadge status={loan.status} />
                        </div>
                        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Linked Project</p>
                           <p className="text-sm font-bold text-gray-900">{loan.lead.project?.name || 'Manual Lead'}</p>
                           <p className="text-xs text-gray-500 font-medium mt-0.5">{loan.lead.project?.projectType || 'Standard'}</p>
                        </div>
                    </div>

                    {/* Financial Overview */}
                    <div className="bg-indigo-50/30 rounded-3xl p-8 border border-indigo-100/50">
                        <div className="flex items-end justify-between gap-10">
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Requested Amount</p>
                                <p className="text-4xl font-extrabold text-indigo-900 tracking-tight">{formatAmount(loan.loanAmount)}</p>
                            </div>
                            <div className="flex-1 border-l border-indigo-100 pl-10">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Eligible Amount</p>
                                <p className="text-4xl font-extrabold text-emerald-900 tracking-tight">{formatAmount(loan.eligibleAmount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bank & Documents */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {loan.bank && (
                           <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                   <SidebarIcon name="bank" className="w-6 h-6" />
                               </div>
                               <div>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Preferred Bank</p>
                                   <p className="text-sm font-bold text-gray-900">{loan.bank.name}</p>
                                   <p className="text-xs text-blue-600 font-bold">{loan.bank.percentage}% interest</p>
                               </div>
                           </div>
                        )}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                           <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                               <SidebarIcon name="document" className="w-6 h-6" />
                           </div>
                           <div>
                               <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Documents</p>
                               <p className="text-sm font-bold text-gray-900">{loan.documents.length} Files Linked</p>
                               <p className="text-xs text-gray-500 font-medium">{loan.documents.filter(d => d.status === 'APPROVED').length} Approved</p>
                           </div>
                        </div>
                    </div>

                    {/* Notes & Actions */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update application</p>
                        <textarea
                            value={statusNotes}
                            onChange={e => setStatusNotes(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[120px] transition-all"
                            placeholder="Add internal notes for this processing step..."
                        />
                        
                        <div className="flex flex-wrap gap-3 mt-4">
                            {STATUS_ORDER.filter(s => s !== loan.status).map(s => {
                                const cfg = STATUS_CONFIG[s];
                                return (
                                    <button 
                                        key={s} 
                                        disabled={updatingStatus} 
                                        onClick={() => handleStatusChange(s)}
                                        className={`px-5 py-2.5 rounded-xl border-2 ${cfg.color.replace('text', 'border')} ${cfg.color} text-xs font-black uppercase tracking-widest hover:opacity-80 disabled:opacity-50 transition-all`}
                                    >
                                        Update to {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BuyerLoansPage() {
    const { token } = useAuth();
    const [loans, setLoans] = useState<BuyerLoanApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<BuyerLoanApplication | null>(null);
    const [filterStatus, setFilterStatus] = useState<BuyerLoanStatus | 'ALL'>('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        buyerLoansService.getAll(token)
            .then(setLoans)
            .catch(() => setLoans([]))
            .finally(() => setLoading(false));
    }, [token]);

    const filtered = loans.filter(l => {
        const matchStatus = filterStatus === 'ALL' || l.status === filterStatus;
        const matchSearch = !search ||
            l.lead.name.toLowerCase().includes(search.toLowerCase()) ||
            l.lead.phone.includes(search) ||
            (l.lead.project?.name || '').toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const stats = {
        total: loans.length,
        new: loans.filter(l => l.status === 'NEW').length,
        underReview: loans.filter(l => l.status === 'UNDER_REVIEW').length,
        approved: loans.filter(l => l.status === 'APPROVED').length,
    };

    function handleStatusUpdate(updated: BuyerLoanApplication) {
        setLoans(prev => prev.map(l => l.id === updated.id ? updated : l));
        setSelected(updated);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                        <Link href="/dashboard" className="p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Buyer Loans</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Buyer Applications</h1>
                    <p className="text-gray-500 mt-1 font-medium">Process and manage individual buyer loan requests</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                   {[
                        { label: 'Total Apps', value: stats.total, color: 'text-gray-900', bg: 'bg-white', icon: 'person' },
                        { label: 'New Today', value: stats.new, color: 'text-amber-600', bg: 'bg-white', icon: 'note' },
                        { label: 'In Review', value: stats.underReview, color: 'text-blue-600', bg: 'bg-white', icon: 'clipboard' },
                        { label: 'Total Approved', value: stats.approved, color: 'text-emerald-600', bg: 'bg-white', icon: 'bank' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                <div className={`w-8 h-8 rounded-lg ${stat.color.replace('text', 'bg')}/10 flex items-center justify-center ${stat.color}`}>
                                    <SidebarIcon name={stat.icon as any} className="w-4 h-4" />
                                </div>
                            </div>
                            <p className={`text-4xl font-extrabold ${stat.color} leading-none tracking-tight`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search buyer name, project or phone..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        {(['ALL', ...STATUS_ORDER] as (BuyerLoanStatus | 'ALL')[]).map(s => {
                            const active = filterStatus === s;
                            return (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${
                                        active ? 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-100' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                                    }`}
                                >
                                    {s === 'ALL' ? 'All Applications' : STATUS_CONFIG[s].label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* List Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="py-32 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Records...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-32 text-center bg-white px-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <SidebarIcon name="person" className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Clear Records</h3>
                            <p className="text-gray-500 mt-2 font-medium max-w-sm mx-auto">No buyer loan applications match your current search or filter criteria.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filtered.map(loan => (
                                <div 
                                    key={loan.id} 
                                    onClick={() => setSelected(loan)} 
                                    className="p-6 hover:bg-indigo-50/30 cursor-pointer transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-105 transition-transform">
                                            {loan.lead.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{loan.lead.name}</h3>
                                                <StatusBadge status={loan.status} />
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                                <span className="flex items-center gap-1.5"><SidebarIcon name="note" className="w-3.5 h-3.5" /> {loan.lead.project?.name || 'Manual Listing'}</span>
                                                <span className="flex items-center gap-1.5"><SidebarIcon name="handshake" className="w-3.5 h-3.5" /> {loan.lead.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-10">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Loan Amount</p>
                                            <p className="text-xl font-black text-gray-900 tracking-tighter leading-none">{formatAmount(loan.loanAmount)}</p>
                                        </div>

                                        <div className="p-3 text-gray-300 group-hover:text-indigo-500 transition-all">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Overlay */}
            {selected && token && (
                <DetailPanel
                    loan={selected}
                    token={token}
                    onClose={() => setSelected(null)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </div>
    );
}
