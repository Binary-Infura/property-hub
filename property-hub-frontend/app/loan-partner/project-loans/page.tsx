'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { projectLoansService, ProjectLoanApplication, ReviewStatus, BankStatus } from '@/app/services/loanService';

// ─── Status Config ────────────────────────────────────────────────────────────

const REVIEW_CONFIG: Record<ReviewStatus, { label: string; color: string; bg: string }> = {
    PENDING:     { label: 'Pending',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    IN_PROGRESS: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    COMPLETED:   { label: 'Completed',   color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

const BANK_STATUS_CONFIG: Record<BankStatus, { label: string; color: string; bg: string; icon: string }> = {
    APPROVED:      { label: 'Bank Approved',   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '✅' },
    LIMITED:       { label: 'Limited Approval', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '⚠️' },
    NOT_AVAILABLE: { label: 'Not Available',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: '❌' },
};

function ReviewBadge({ status }: { status: ReviewStatus }) {
    const cfg = REVIEW_CONFIG[status];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '20px',
            background: cfg.bg, color: cfg.color,
            fontSize: '12px', fontWeight: 600,
        }}>
            {cfg.label}
        </span>
    );
}

function BankStatusBadge({ status }: { status: BankStatus }) {
    const cfg = BANK_STATUS_CONFIG[status];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 12px', borderRadius: '20px',
            background: cfg.bg, color: cfg.color,
            fontSize: '12px', fontWeight: 600,
        }}>
            {cfg.icon} {cfg.label}
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
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
        }} onClick={onClose}>
            <div style={{
                background: '#fff', borderRadius: '20px', width: '90%', maxWidth: 660,
                maxHeight: '90vh', overflowY: 'auto', padding: '32px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#3b82f6', textTransform: 'uppercase', marginBottom: 4 }}>
                            Project Loan Application
                        </div>
                        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{app.project.name}</h2>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                            {app.project.projectType} · {app.project.addressRecord?.city?.name || 'City N/A'}, {app.project.addressRecord?.city?.state || ''}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    <ReviewBadge status={app.reviewStatus} />
                    <BankStatusBadge status={app.bankStatus} />
                </div>

                {/* Builder Info */}
                {app.project.onboardedBy && (
                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Builder</div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                            {app.project.onboardedBy.firstName} {app.project.onboardedBy.lastName}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>{app.project.onboardedBy.email}</div>
                    </div>
                )}

                {/* Bank */}
                <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Bank for Review</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#1e40af' }}>{app.bank.name}</div>
                    <div style={{ fontSize: 13, color: '#3b82f6' }}>{app.bank.percentage}% interest rate</div>
                </div>

                {/* Documents */}
                {app.documents.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Documents</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {app.documents.map(doc => (
                                <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    background: '#f8fafc', borderRadius: 10, padding: '10px 14px',
                                    color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 500,
                                }}>
                                    <span>📄</span>
                                    <span style={{ flex: 1 }}>{doc.name}</span>
                                    <span style={{ fontSize: 11, color: '#64748b' }}>{doc.category}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Remarks */}
                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Remarks</label>
                    <textarea
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        style={{ width: '100%', minHeight: 80, borderRadius: 10, border: '1px solid #e2e8f0', padding: '10px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        placeholder="Add remarks about this bank eligibility review..."
                    />
                </div>

                {/* Review Status Actions */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Review Progress</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as ReviewStatus[]).map(s => {
                            const cfg = REVIEW_CONFIG[s];
                            const active = app.reviewStatus === s;
                            return (
                                <button key={s} disabled={updating || active} onClick={() => handleUpdate({ reviewStatus: s })} style={{
                                    flex: 1, padding: '10px 12px', borderRadius: 10,
                                    border: `1.5px solid ${active ? cfg.color : '#e2e8f0'}`,
                                    background: active ? cfg.bg : '#fff',
                                    color: active ? cfg.color : '#64748b',
                                    fontWeight: 600, fontSize: 12, cursor: active || updating ? 'default' : 'pointer',
                                    transition: 'all 0.15s',
                                }}>
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bank Status Actions */}
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Bank Eligibility Decision</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {(['APPROVED', 'LIMITED', 'NOT_AVAILABLE'] as BankStatus[]).map(s => {
                            const cfg = BANK_STATUS_CONFIG[s];
                            const active = app.bankStatus === s;
                            return (
                                <button key={s} disabled={updating || active} onClick={() => handleUpdate({ bankStatus: s })} style={{
                                    flex: 1, padding: '10px 8px', borderRadius: 10,
                                    border: `1.5px solid ${active ? cfg.color : '#e2e8f0'}`,
                                    background: active ? cfg.bg : '#fff',
                                    color: active ? cfg.color : '#64748b',
                                    fontWeight: 600, fontSize: 11, cursor: active || updating ? 'default' : 'pointer',
                                    transition: 'all 0.15s',
                                }}>
                                    {cfg.icon} {cfg.label}
                                </button>
                            );
                        })}
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
        <div style={{ padding: '32px', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#3b82f6', textTransform: 'uppercase', marginBottom: 6 }}>Flow 2</div>
                <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, color: '#0f172a' }}>Project Loans</h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>Review bank eligibility for assigned projects</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total', value: stats.total, color: '#3b82f6', icon: '🏗️' },
                    { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: '⏳' },
                    { label: 'In Progress', value: stats.inProgress, color: '#6366f1', icon: '🔄' },
                    { label: 'Bank Approved', value: stats.approved, color: '#10b981', icon: '🏦' },
                ].map(stat => (
                    <div key={stat.label} style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 22 }}>{stat.icon}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by project, bank, city..."
                    style={{ flex: 1, minWidth: 240, padding: '10px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                />
                {/* Review filter */}
                <select
                    value={filterReview}
                    onChange={e => setFilterReview(e.target.value as ReviewStatus | 'ALL')}
                    style={{ padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', background: '#fff', fontFamily: 'inherit' }}
                >
                    <option value="ALL">All Reviews</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                </select>
                {/* Bank filter */}
                <select
                    value={filterBank}
                    onChange={e => setFilterBank(e.target.value)}
                    style={{ padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', background: '#fff', fontFamily: 'inherit' }}
                >
                    <option value="ALL">All Banks</option>
                    {uniqueBanks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
            </div>

            {/* Pre-approved banner */}
            {apps.filter(a => a.bankStatus === 'APPROVED').length > 0 && (
                <div style={{
                    display: 'flex', gap: 12, alignItems: 'center',
                    background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                    border: '1.5px solid #6ee7b7', borderRadius: 14, padding: '14px 20px', marginBottom: 20,
                }}>
                    <span style={{ fontSize: 20 }}>🚀</span>
                    <div>
                        <div style={{ fontWeight: 700, color: '#065f46', fontSize: 14 }}>
                            {apps.filter(a => a.bankStatus === 'APPROVED').length} project(s) with bank approval — buyer loans will be faster!
                        </div>
                        <div style={{ fontSize: 12, color: '#059669' }}>Pre-approved projects speed up the buyer loan process (Flow 1)</div>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8', fontSize: 15 }}>Loading project loan applications...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, background: '#fff', borderRadius: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🏗️</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>No project loan applications found</div>
                    <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>Project bank eligibility reviews assigned to you will appear here</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                    {filtered.map(app => (
                        <div key={app.id} onClick={() => setSelected(app)} style={{
                            background: '#fff', borderRadius: 16, padding: 20,
                            boxShadow: '0 1px 6px rgba(0,0,0,0.06)', cursor: 'pointer',
                            border: '1.5px solid transparent', transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = '#3b82f6', e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.12)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent', e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.06)')}
                        >
                            {/* Project name & type */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 2 }}>{app.project.name}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>
                                        {app.project.projectType} · {app.project.addressRecord?.city?.name || '—'}
                                    </div>
                                </div>
                                <ReviewBadge status={app.reviewStatus} />
                            </div>

                            {/* Bank chip */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: 10,
                                padding: '8px 12px', marginBottom: 12, width: '100%', boxSizing: 'border-box',
                            }}>
                                <span style={{ fontSize: 18 }}>🏦</span>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af' }}>{app.bank.name}</div>
                                    <div style={{ fontSize: 11, color: '#3b82f6' }}>{app.bank.percentage}% rate</div>
                                </div>
                            </div>

                            {/* Bank status */}
                            <div style={{ marginBottom: 12 }}>
                                <BankStatusBadge status={app.bankStatus} />
                            </div>

                            {/* Builder */}
                            {app.project.onboardedBy && (
                                <div style={{ fontSize: 12, color: '#64748b' }}>
                                    Builder: <span style={{ fontWeight: 600, color: '#475569' }}>
                                        {app.project.onboardedBy.firstName} {app.project.onboardedBy.lastName}
                                    </span>
                                </div>
                            )}

                            {/* Remarks */}
                            {app.remarks && (
                                <div style={{ marginTop: 10, padding: '8px 12px', background: '#fefce8', borderRadius: 8, borderLeft: '3px solid #fbbf24' }}>
                                    <div style={{ fontSize: 11, color: '#92400e' }}>{app.remarks}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
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
