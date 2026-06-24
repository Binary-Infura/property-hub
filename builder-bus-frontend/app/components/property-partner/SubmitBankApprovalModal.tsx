'use client';

import React, { useState, useEffect } from 'react';
import { bankService, Bank } from '@/app/services/bankService';
import { projectLoansService } from '@/app/services/loanService';
import { useAuth } from '@/app/contexts/AuthContext';

interface SubmitBankApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: { id: string; title: string; status: string }[];
    onSuccess?: () => void;
}

export default function SubmitBankApprovalModal({
    isOpen,
    onClose,
    projects,
    onSuccess,
}: SubmitBankApprovalModalProps) {
    const { token } = useAuth();
    const [banks, setBanks] = useState<Bank[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedBankId, setSelectedBankId] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setSelectedProjectId(projects[0]?.id || '');
        setSelectedBankId('');
        setSubmitted(false);

        setLoading(true);
        bankService.getActiveBanks()
            .then(setBanks)
            .catch(() => setBanks([]))
            .finally(() => setLoading(false));
    }, [isOpen, projects]);

    function toggleBank(id: string) {
        setSelectedBankId(id);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!token || !selectedProjectId || !selectedBankId) return;

        setSubmitting(true);
        try {
            await projectLoansService.createForProject(token, selectedProjectId, [selectedBankId]);
            setSubmitted(true);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Failed to submit for bank approval.');
        } finally {
            setSubmitting(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
        }} onClick={onClose}>
            <div style={{
                background: '#fff', borderRadius: 20, width: '90%', maxWidth: 540,
                padding: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
                maxHeight: '90vh', overflowY: 'auto',
            }} onClick={e => e.stopPropagation()}>

                {/* Success State */}
                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>🏦</div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>
                            Submitted for Bank Approval!
                        </h2>
                        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
                            Our Loan Partner team will review your project's bank eligibility and update you shortly.
                        </p>
                        <button onClick={onClose} style={{
                            padding: '12px 32px', borderRadius: 12, background: '#10b981',
                            color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
                        }}>
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                                    Flow 2 · Project Loans
                                </div>
                                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                                    Submit for Bank Approval
                                </h2>
                                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                                    Select a project and the bank you want eligibility reviewed for
                                </p>
                            </div>
                            <button type="button" onClick={onClose} style={{
                                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                                width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#64748b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>×</button>
                        </div>

                        {/* Project Select */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Select Project
                            </label>
                            <select
                                required
                                value={selectedProjectId}
                                onChange={e => setSelectedProjectId(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 12,
                                    border: '1.5px solid #e2e8f0', fontSize: 14, fontWeight: 600,
                                    color: '#1e293b', background: '#f8fafc', outline: 'none', fontFamily: 'inherit',
                                    boxSizing: 'border-box',
                                }}
                            >
                                <option value="">-- Choose a project --</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.title} ({p.status})</option>
                                ))}
                            </select>
                        </div>

                        {/* Bank Selection */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Select Bank for Eligibility Review
                            </label>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>Loading banks...</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {banks.map(bank => {
                                        const checked = selectedBankId === bank.id;
                                        return (
                                            <label key={bank.id} style={{
                                                display: 'flex', alignItems: 'center', gap: 14,
                                                padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                                                border: `1.5px solid ${checked ? '#3b82f6' : '#e2e8f0'}`,
                                                background: checked ? 'rgba(59,130,246,0.05)' : '#f8fafc',
                                                transition: 'all 0.15s',
                                            }}>
                                                <input
                                                    type="radio"
                                                    name="bankSelect"
                                                    checked={checked}
                                                    onChange={() => toggleBank(bank.id)}
                                                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#3b82f6' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{bank.name}</div>
                                                    <div style={{ fontSize: 12, color: checked ? '#3b82f6' : '#94a3b8', fontWeight: 500 }}>
                                                        {bank.percentage}% interest rate
                                                    </div>
                                                </div>
                                                {checked && (
                                                    <span style={{ color: '#3b82f6', fontSize: 18, fontWeight: 700 }}>✓</span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Info Banner */}
                        <div style={{
                            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                            border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 16px',
                            marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start',
                        }}>
                            <span style={{ fontSize: 18, flexShrink: 0 }}>ℹ️</span>
                            <p style={{ margin: 0, fontSize: 12, color: '#1e40af', lineHeight: 1.6 }}>
                                Our Loan Partner team will review your project's eligibility with the selected bank.
                                This helps buyers get pre-approved loans faster. The Central Authority will assign a
                                Loan Partner who will update the approval status.
                            </p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" onClick={onClose} style={{
                                flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0',
                                background: '#fff', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                            }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting || !selectedBankId || !selectedProjectId} style={{
                                flex: 2, padding: '12px', borderRadius: 12, border: 'none',
                                background: !selectedBankId || !selectedProjectId ? '#e2e8f0' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: !selectedBankId || !selectedProjectId ? '#94a3b8' : '#fff',
                                fontWeight: 700, fontSize: 14,
                                cursor: submitting || !selectedBankId || !selectedProjectId ? 'not-allowed' : 'pointer',
                                boxShadow: selectedBankId && selectedProjectId ? '0 4px 16px rgba(59,130,246,0.3)' : 'none',
                                transition: 'all 0.15s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}>
                                {submitting ? (
                                    <>
                                        <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>🏦 Submit for Bank Approval</>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
