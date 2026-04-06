'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { buyerLoansService, BuyerLoanApplication, BuyerLoanStatus } from '@/app/services/loanService';

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BuyerLoanStatus, { label: string; color: string; bg: string; dot: string }> = {
    NEW:          { label: 'New',          color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  dot: '#6366f1' },
    DOC_PENDING:  { label: 'Doc Pending',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  dot: '#f59e0b' },
    UNDER_REVIEW: { label: 'Under Review', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  dot: '#3b82f6' },
    APPROVED:     { label: 'Approved',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',  dot: '#10b981' },
    REJECTED:     { label: 'Rejected',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   dot: '#ef4444' },
};

const STATUS_ORDER: BuyerLoanStatus[] = ['NEW', 'DOC_PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

function StatusBadge({ status }: { status: BuyerLoanStatus }) {
    const cfg = STATUS_CONFIG[status];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '20px',
            background: cfg.bg, color: cfg.color,
            fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em',
        }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
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
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
        }} onClick={onClose}>
            <div style={{
                background: '#fff', borderRadius: '20px', width: '90%', maxWidth: 640,
                maxHeight: '90vh', overflowY: 'auto', padding: '32px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#6366f1', textTransform: 'uppercase', marginBottom: 4 }}>
                            Buyer Loan Application
                        </div>
                        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{loan.lead.name}</h2>
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{loan.lead.phone} · {loan.lead.email || '—'}</div>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
                </div>

                <StatusBadge status={loan.status} />

                {/* Project Info */}
                {loan.lead.project && (
                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', marginTop: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Project</div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{loan.lead.project.name}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>{loan.lead.project.projectType}</div>
                    </div>
                )}

                {/* Loan Amounts */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Loan Amount</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{formatAmount(loan.loanAmount)}</div>
                    </div>
                    <div style={{ background: '#ecfdf5', borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Eligible Amount</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#065f46', marginTop: 4 }}>{formatAmount(loan.eligibleAmount)}</div>
                    </div>
                </div>

                {/* Bank */}
                {loan.bank && (
                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Bank</div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{loan.bank.name}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>{loan.bank.percentage}% interest rate</div>
                    </div>
                )}

                {/* Documents */}
                {loan.documents.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Linked Documents</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {loan.documents.map(doc => (
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

                {/* Notes */}
                <div style={{ marginTop: 16 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Notes</label>
                    <textarea
                        value={statusNotes}
                        onChange={e => setStatusNotes(e.target.value)}
                        style={{ width: '100%', minHeight: 80, borderRadius: 10, border: '1px solid #e2e8f0', padding: '10px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                        placeholder="Add notes..."
                    />
                </div>

                {/* Status Actions */}
                <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Update Status</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {STATUS_ORDER.filter(s => s !== loan.status).map(s => {
                            const cfg = STATUS_CONFIG[s];
                            return (
                                <button key={s} disabled={updatingStatus} onClick={() => handleStatusChange(s)} style={{
                                    padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${cfg.color}`,
                                    background: 'transparent', color: cfg.color, fontWeight: 600, fontSize: 13,
                                    cursor: updatingStatus ? 'not-allowed' : 'pointer', opacity: updatingStatus ? 0.5 : 1,
                                    transition: 'all 0.15s',
                                }}>
                                    → {cfg.label}
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
        <div style={{ padding: '32px', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#6366f1', textTransform: 'uppercase', marginBottom: 6 }}>Flow 1</div>
                <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, color: '#0f172a' }}>Buyer Loans</h1>
                <p style={{ margin: 0, color: '#64748b', fontSize: 15 }}>Manage buyer loan applications assigned to you</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total', value: stats.total, color: '#6366f1', icon: '📋' },
                    { label: 'New', value: stats.new, color: '#f59e0b', icon: '🆕' },
                    { label: 'Under Review', value: stats.underReview, color: '#3b82f6', icon: '🔍' },
                    { label: 'Approved', value: stats.approved, color: '#10b981', icon: '✅' },
                ].map(stat => (
                    <div key={stat.label} style={{ background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
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
                    placeholder="Search by buyer name, phone, project..."
                    style={{ flex: 1, minWidth: 240, padding: '10px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(['ALL', ...STATUS_ORDER] as (BuyerLoanStatus | 'ALL')[]).map(s => {
                        const active = filterStatus === s;
                        const cfg = s !== 'ALL' ? STATUS_CONFIG[s] : null;
                        return (
                            <button key={s} onClick={() => setFilterStatus(s)} style={{
                                padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                background: active ? (cfg?.color || '#6366f1') : '#fff',
                                color: active ? '#fff' : '#64748b',
                                boxShadow: active ? `0 2px 10px ${cfg?.color || '#6366f1'}44` : '0 1px 4px rgba(0,0,0,0.08)',
                                transition: 'all 0.15s',
                            }}>
                                {s === 'ALL' ? 'All' : STATUS_CONFIG[s].label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 80, color: '#94a3b8', fontSize: 15 }}>Loading buyer loans...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 80, background: '#fff', borderRadius: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>No loan applications found</div>
                    <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>Buyer loans assigned to you will appear here</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {filtered.map(loan => (
                        <div key={loan.id} onClick={() => setSelected(loan)} style={{
                            background: '#fff', borderRadius: 16, padding: '20px 24px',
                            boxShadow: '0 1px 6px rgba(0,0,0,0.06)', cursor: 'pointer',
                            display: 'flex', gap: 20, alignItems: 'center',
                            border: '1.5px solid transparent',
                            transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1', e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.12)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent', e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.06)')}
                        >
                            {/* Avatar */}
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0,
                            }}>
                                {loan.lead.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Main info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{loan.lead.name}</span>
                                    <StatusBadge status={loan.status} />
                                </div>
                                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                                    {loan.lead.phone} · {loan.lead.project?.name || 'No project linked'}
                                </div>
                            </div>

                            {/* Amount */}
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{formatAmount(loan.loanAmount)}</div>
                                {loan.bank && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{loan.bank.name}</div>}
                                {loan.eligibleAmount && (
                                    <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Eligible: {formatAmount(loan.eligibleAmount)}</div>
                                )}
                            </div>

                            <div style={{ color: '#cbd5e1', fontSize: 20, flexShrink: 0 }}>›</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
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
