"use client";

import React, { useState, useEffect } from 'react';
import { bankService, Bank } from '@/app/services/bankService';
import { loanService } from '@/app/services/loanService';
import { useAuth } from '@/app/contexts/AuthContext';

interface LoanSubmitModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: {
        id: string;
        name: string;
        projectId?: string;
        projectName?: string;
    };
    onSuccess?: () => void;
}

export default function LoanSubmitModal({ isOpen, onClose, lead, onSuccess }: LoanSubmitModalProps) {
    const { token } = useAuth();
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        tenureYears: '15',
        bankId: '',
        interestRate: '',
        notes: '',
    });

    useEffect(() => {
        if (isOpen && token) {
            const fetchBanks = async () => {
                setLoading(true);
                try {
                    const activeBanks = await bankService.getActiveBanks();
                    setBanks(activeBanks);
                    if (activeBanks.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            bankId: activeBanks[0].id,
                            interestRate: activeBanks[0].percentage.toString()
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching banks:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchBanks();
        }
    }, [isOpen, token]);

    const handleBankChange = (bankId: string) => {
        const selectedBank = banks.find(b => b.id === bankId);
        if (selectedBank) {
            setFormData(prev => ({
                ...prev,
                bankId,
                interestRate: selectedBank.percentage.toString()
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !lead.projectId) return;

        setSubmitting(true);
        try {
            await loanService.submitLoan(token, {
                leadId: lead.id,
                projectId: lead.projectId,
                bankId: formData.bankId,
                amount: parseFloat(formData.amount),
                tenureYears: parseInt(formData.tenureYears),
                interestRate: parseFloat(formData.interestRate),
                notes: formData.notes
            });
            alert('Loan application submitted successfully!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error submitting loan:', error);
            alert('Failed to submit loan application.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-gray-900">
                        Submit Loan Application
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="space-y-6">
                        {/* Info Section */}
                        <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <div>
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Applicant</p>
                                <p className="font-bold text-gray-900">{lead.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Project</p>
                                <p className="font-bold text-gray-900">{lead.projectName || 'Assigned Project'}</p>
                            </div>
                        </div>

                        {/* Amount & Tenure */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Loan Amount (₹)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 sm:text-sm">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                                        placeholder="Enter amount"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700">Tenure (Years)</label>
                                <select
                                    value={formData.tenureYears}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tenureYears: e.target.value }))}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all bg-white"
                                >
                                    {[5, 10, 15, 20, 25, 30].map(yr => (
                                        <option key={yr} value={yr}>{yr} Years</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Preferred Bank */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">Preferred Bank</label>
                            {loading ? (
                                <div className="h-10 bg-gray-100 animate-pulse rounded-xl"></div>
                            ) : (
                                <select
                                    value={formData.bankId}
                                    onChange={(e) => handleBankChange(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all bg-white"
                                >
                                    {banks.map(bank => (
                                        <option key={bank.id} value={bank.id}>{bank.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Interest Rate */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">Interest Rate (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.interestRate}
                                onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold transition-all"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">Additional Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                rows={3}
                                placeholder="Any special requirements or details for the bank..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !lead.projectId}
                            className={`flex-[2] inline-flex justify-center items-center rounded-xl shadow-lg px-4 py-3 text-sm font-bold text-white transition-all ${submitting || !lead.projectId
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 active:scale-[0.98]'
                                }`}
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting Application...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
