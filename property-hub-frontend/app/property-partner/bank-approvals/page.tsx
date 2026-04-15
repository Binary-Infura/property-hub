'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { projectLoansService, ProjectLoanApplication, ReviewStatus, BankStatus } from '@/app/services/loanService';
import { projectService, Project } from '@/app/services/propertyService';
import SubmitBankApprovalModal from '@/app/components/property-partner/SubmitBankApprovalModal';

// ─── Badge helpers ────────────────────────────────────────────────────────────

const REVIEW_STYLES: Record<ReviewStatus, { label: string; className: string }> = {
    PENDING:     { label: 'Pending Review',  className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200' },
    IN_PROGRESS: { label: 'In Progress',     className: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200' },
    COMPLETED:   { label: 'Completed',       className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200' },
};

const BANK_STYLES: Record<BankStatus, { label: string; className: string }> = {
    APPROVED:      { label: 'Bank Approved',  className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200' },
    LIMITED:       { label: 'Limited',        className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200' },
    NOT_AVAILABLE: { label: 'Not Available',  className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BankApprovalsPage() {
    const { token } = useAuth();
    const [apps, setApps] = useState<ProjectLoanApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [filterReview, setFilterReview] = useState<ReviewStatus | 'all'>('all');
    const [filterBank, setFilterBank] = useState<BankStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchApps = () => {
        if (!token) return;
        setLoading(true);
        projectLoansService.getAll(token)
            .then(setApps)
            .catch(() => setApps([]))
            .finally(() => setLoading(false));
    };

    const fetchProjects = () => {
        if (!token) return;
        projectService.getAll(token, true)
            .then(setAllProjects)
            .catch(() => setAllProjects([]));
    };

    useEffect(() => {
        fetchApps();
        fetchProjects();
    }, [token]);

    const filtered = apps.filter(a => {
        const matchReview = filterReview === 'all' || a.reviewStatus === filterReview;
        const matchBank = filterBank === 'all' || a.bankStatus === filterBank;
        const matchSearch = !search ||
            a.project.name.toLowerCase().includes(search.toLowerCase()) ||
            a.bank.name.toLowerCase().includes(search.toLowerCase());
        return matchReview && matchBank && matchSearch;
    });

    // Group filtered apps by project
    const grouped = filtered.reduce<Record<string, { project: ProjectLoanApplication['project']; apps: ProjectLoanApplication[] }>>((acc, a) => {
        if (!acc[a.projectId]) acc[a.projectId] = { project: a.project, apps: [] };
        acc[a.projectId].apps.push(a);
        return acc;
    }, {});

    const stats = {
        total: apps.length,
        projects: new Set(apps.map(a => a.projectId)).size,
        pending: apps.filter(a => a.reviewStatus === 'PENDING').length,
        approved: apps.filter(a => a.bankStatus === 'APPROVED').length,
    };

    if (loading && apps.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                Loading bank approvals...
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bank Approvals</h1>
                    <p className="text-gray-600 mt-1">Track your project bank eligibility submissions</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    New Submission
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Total Submissions', count: stats.total,    color: 'text-gray-900' },
                    { label: 'Projects',          count: stats.projects, color: 'text-indigo-600' },
                    { label: 'Awaiting Review',   count: stats.pending,  color: 'text-amber-600' },
                    { label: 'Bank Approved',     count: stats.approved, color: 'text-emerald-600' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className={`text-2xl font-black mt-2 ${stat.color}`}>{stat.count}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    <div className="flex-1 w-full relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search by project or bank..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterReview(s as ReviewStatus | 'all')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                    filterReview === s
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {s === 'all' ? 'All Stages' : s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'APPROVED', 'LIMITED', 'NOT_AVAILABLE'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterBank(s as BankStatus | 'all')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                    filterBank === s
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {s === 'all' ? 'All Banks' : s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            {Object.keys(grouped).length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No bank approval submissions yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        Submit your projects for bank eligibility review. Pre-approved projects help buyers secure loans faster.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 font-bold transition shadow-lg shadow-indigo-200"
                    >
                        Submit a Project
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.values(grouped).map(({ project, apps: projectApps }) => {
                        const approvedCount = projectApps.filter(a => a.bankStatus === 'APPROVED').length;
                        return (
                            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                                {/* Project header row */}
                                <div className="bg-gray-50/80 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900">{project.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">
                                            {project.projectType} · {project.addressRecord?.city?.name || '—'}, {project.addressRecord?.city?.state || ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {approvedCount > 0 && (
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                🚀 {approvedCount} Bank Approved
                                            </span>
                                        )}
                                        <span className="text-xs font-semibold text-gray-400">
                                            {projectApps.length} bank{projectApps.length !== 1 ? 's' : ''} submitted
                                        </span>
                                    </div>
                                </div>

                                {/* Bank table */}
                                <table className="w-full">
                                    <thead className="border-b border-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Review Stage</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Decision</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loan Partner</th>
                                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {projectApps.map(app => (
                                            <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-gray-900 text-sm">{app.bank.name}</p>
                                                    <p className="text-xs font-semibold text-blue-600 mt-0.5">{app.bank.percentage}% rate</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${REVIEW_STYLES[app.reviewStatus].className}`}>
                                                        {REVIEW_STYLES[app.reviewStatus].label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${BANK_STYLES[app.bankStatus].className}`}>
                                                        {BANK_STYLES[app.bankStatus].label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {app.assignedLoanPartner ? (
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm">
                                                                {app.assignedLoanPartner.firstName} {app.assignedLoanPartner.lastName}
                                                            </p>
                                                            <p className="text-xs text-gray-400">{app.assignedLoanPartner.email}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Awaiting assignment</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {app.remarks ? (
                                                        <p className="text-sm text-gray-600 max-w-xs truncate" title={app.remarks}>{app.remarks}</p>
                                                    ) : (
                                                        <span className="text-xs text-gray-300">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            )}

            <SubmitBankApprovalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projects={allProjects.map(p => ({ id: p.id, title: p.name, status: p.status }))}
                onSuccess={() => { setIsModalOpen(false); fetchApps(); }}
            />
        </div>
    );
}
