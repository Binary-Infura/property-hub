"use client";

import React, { useState, useEffect } from 'react';
import { bankService, Bank } from '@/app/services/bankService';
import { loanService } from '@/app/services/loanService';
import { useAuth } from '@/app/contexts/AuthContext';
import { userService } from '@/app/services/userService';
import { propertyService, Property } from '@/app/services/propertyService';

interface BuyerLoanSubmitModalProps {
    isOpen: boolean;
    onClose: () => void;
    loanPartnerId: string;
    projectId?: string;
    onSuccess?: () => void;
}

export default function BuyerLoanSubmitModal({ isOpen, onClose, loanPartnerId, projectId, onSuccess }: BuyerLoanSubmitModalProps) {
    const { token } = useAuth();
    const [banks, setBanks] = useState<Bank[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        loanAmount: '',
        bankId: '',
        projectId: projectId || '',
        notes: '',
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                projectId: projectId || ''
            }));
        }
    }, [isOpen, projectId]);

    useEffect(() => {
        if (isOpen && token) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const [activeBanks, allProperties, userDocs] = await Promise.all([
                        bankService.getActiveBanks(),
                        propertyService.getAll(token),
                        userService.getMyDocuments(token)
                    ]);

                    setBanks(activeBanks);
                    setProperties(allProperties);
                    setDocuments(userDocs || []);

                    if (activeBanks.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            bankId: activeBanks[0].id,
                            interestRate: activeBanks[0].percentage.toString()
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching modal data:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, token]);

    const handleBankChange = (bankId: string) => {
        setFormData(prev => ({ ...prev, bankId }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setSubmitting(true);
        try {
            // Build lead-linked buyer loan application via the new Flow 1 endpoint
            const payload: any = {
                loanAmount: parseFloat(formData.loanAmount),
                bankId: formData.bankId || undefined,
                notes: formData.notes || undefined,
            };
            // projectId is passed as context but leadId is required —
            // this modal is invoked with loanPartnerId; if the caller provides
            // a leadId it should be forwarded. For now we send projectId as note context.
            await loanService.submitLoan(token, payload);
            alert('Loan application submitted successfully!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error submitting loan:', error);
            alert(error?.response?.data?.message || 'Failed to submit loan application.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-gray-900">
                        Apply for Loan
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

                        {/* Property Selection if not fixed */}
                        {!projectId && (
                            <div className="space-y-1.5 border-b border-gray-100 pb-4">
                                <label className="block text-sm font-bold text-gray-700">Select Property</label>
                                {loading ? (
                                    <div className="h-10 bg-gray-100 animate-pulse rounded-xl"></div>
                                ) : (
                                    <select
                                        required
                                        value={formData.projectId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all bg-white"
                                    >
                                        <option value="">Select a property you are interested in</option>
                                        {properties.map((prop) => (
                                            <option key={prop.id} value={prop.id}>{prop.name} - {prop.location}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">Loan Amount (₹)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 sm:text-sm">₹</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    value={formData.loanAmount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, loanAmount: e.target.value }))}
                                    className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                                    placeholder="Enter amount"
                                />
                            </div>
                        </div>

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
                                    {banks.map((bank: Bank) => (
                                        <option key={bank.id} value={bank.id}>{bank.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>



                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">Additional Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                rows={3}
                                placeholder="Any special requirements..."
                            ></textarea>
                        </div>

                        {documents.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <label className="block text-sm font-bold text-gray-700">Attach Uploaded Documents</label>
                                <div className="space-y-2 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                                    {documents.map((doc: any) => (
                                        <label key={doc.id} className="flex items-center gap-3 cursor-pointer p-1">
                                            <input
                                                type="checkbox"
                                                checked={selectedDocs.includes(doc.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedDocs([...selectedDocs, doc.id]);
                                                    else setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-800">{doc.name}</span>
                                                <span className="text-xs text-gray-400 capitalize">{doc.category}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
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
                            disabled={submitting || !formData.projectId}
                            className={`flex-[2] inline-flex justify-center items-center rounded-xl shadow-lg px-4 py-3 text-sm font-bold text-white transition-all ${submitting || !formData.projectId
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 active:scale-[0.98]'
                                }`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
