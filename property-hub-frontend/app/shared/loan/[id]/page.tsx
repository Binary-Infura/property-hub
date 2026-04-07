"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loanService, BuyerLoanApplication } from '@/app/services/loanService';
import { useAuth } from '@/app/contexts/AuthContext';

export default function LoanDetailsPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const router = useRouter();
    const [loan, setLoan] = useState<BuyerLoanApplication | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLoan = async () => {
            if (!token || !id) return;
            try {
                setLoading(true);
                const data = await loanService.getLoanDetails(token, id as string);
                setLoan(data);
            } catch (error) {
                console.error("Failed to fetch loan details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLoan();
    }, [token, id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Loading application details...</p>
            </div>
        );
    }

    if (!loan) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-6 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Application Not Found</h1>
                <p className="text-gray-500 mt-2">The application you are looking for might have been removed or you don't have access to it.</p>
                <button 
                    onClick={() => router.push('/dashboard/loan')}
                    className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
                >
                    Back to Loans
                </button>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        'NEW': 'bg-blue-50 text-blue-700 border-blue-100',
        'DOC_PENDING': 'bg-orange-50 text-orange-700 border-orange-100',
        'UNDER_REVIEW': 'bg-purple-50 text-purple-700 border-purple-100',
        'APPROVED': 'bg-green-50 text-green-700 border-green-100',
        'REJECTED': 'bg-red-50 text-red-700 border-red-100',
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Breadcrumb */}
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-blue-600 transition-colors mb-4 group"
                    >
                        <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Application Details</h1>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusColors[loan.status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                            {loan.status.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-gray-400 mt-1 font-medium text-sm">Case ID: <span className="text-gray-600">{loan.id.split('-')[0].toUpperCase()}</span> • Submitted on {new Date(loan.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
                
                <div className="flex gap-3">
                    <button className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
                        Contact Support
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Summary Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-gray-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                             <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                             </svg>
                        </div>
                        <div className="relative z-10">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-2 block">Requested Loan Amount</label>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black leading-none">₹{loan.loanAmount.toLocaleString()}</span>
                                <span className="text-lg opacity-60 font-bold">INR</span>
                            </div>
                            <div className="mt-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 block">Preferred Bank</label>
                                    <p className="font-bold text-lg">{loan.bank?.name || 'Not Specified'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 block">Loan Partner</label>
                                    <p className="font-bold text-lg">{loan.assignedLoanPartner ? `${loan.assignedLoanPartner.firstName} ${loan.assignedLoanPartner.lastName || ''}` : 'Assigning Soon...'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Project Selection</h3>
                            <p className="text-sm text-gray-500 font-medium">
                                {loan.lead?.project?.name ? (
                                    <>Linked to <span className="text-blue-600 font-bold">{loan.lead.project.name}</span></>
                                ) : (
                                    "This application is not linked to a specific project."
                                )}
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Notes & Context</h3>
                            <p className="text-sm text-gray-500 font-medium italic">
                                "{loan.notes || 'No notes provided with this application.'}"
                            </p>
                        </div>
                    </div>

                    {/* Documents List */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Attached Documents</h2>
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black text-gray-500 uppercase">{loan.documents?.length || 0} Total</span>
                        </div>

                        {loan.documents && loan.documents.length > 0 ? (
                            <div className="space-y-3">
                                {loan.documents.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 group transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{doc.category}</p>
                                            </div>
                                        </div>
                                        <a 
                                            href={doc.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-400 font-medium">No documents attached to this application.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Sidebar Info */}
                <div className="space-y-8">
                    {/* Status Tracker */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Process Timeline</h3>
                        <div className="space-y-8 relative">
                            <div className="absolute top-0 bottom-0 left-4 w-px bg-gray-100 z-0"></div>
                            
                            {[
                                { label: 'Application Submitted', date: loan.createdAt, status: 'COMPLETED' },
                                { label: 'Assigned to Expert', date: loan.assignedLoanPartnerId ? 'DONE' : 'PENDING', status: loan.assignedLoanPartnerId ? 'COMPLETED' : 'ACTIVE' },
                                { label: 'Document Verification', status: loan.status === 'DOC_PENDING' ? 'ACTION' : (['UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(loan.status) ? 'COMPLETED' : 'PENDING') },
                                { label: 'Bank Review', status: ['APPROVED', 'REJECTED'].includes(loan.status) ? 'COMPLETED' : (loan.status === 'UNDER_REVIEW' ? 'ACTIVE' : 'PENDING') },
                                { label: 'Final Decision', status: (loan.status === 'APPROVED' || loan.status === 'REJECTED') ? 'COMPLETED' : 'PENDING' }
                            ].map((step, idx) => (
                                <div key={idx} className="flex gap-6 relative z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                                        step.status === 'COMPLETED' ? 'bg-blue-600 border-blue-50 text-white' :
                                        step.status === 'ACTIVE' ? 'bg-white border-blue-200 text-blue-600' :
                                        step.status === 'ACTION' ? 'bg-orange-500 border-orange-50 text-white animate-pulse' :
                                        'bg-white border-gray-100 text-gray-300'
                                    }`}>
                                        {step.status === 'COMPLETED' ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <span className="text-xs font-black">{idx + 1}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${step.status === 'COMPLETED' ? 'text-gray-900' : (step.status === 'ACTIVE' || step.status === 'ACTION' ? 'text-blue-600' : 'text-gray-400')}`}>
                                            {step.label}
                                        </p>
                                        {step.date && step.date !== 'DONE' && step.date !== 'PENDING' && (
                                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{new Date(step.date).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Partner Card */}
                    {loan.assignedLoanPartner && (
                        <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-100">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-6 block">Assigned Expert</label>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center font-bold text-xl uppercase backdrop-blur-sm border border-white/10">
                                    {loan.assignedLoanPartner.firstName[0]}{loan.assignedLoanPartner.lastName?.[0] || ''}
                                </div>
                                <div>
                                    <p className="font-bold text-lg leading-tight">{loan.assignedLoanPartner.firstName} {loan.assignedLoanPartner.lastName || ''}</p>
                                    <p className="text-blue-200 text-xs font-medium">Loan Advisor</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <button 
                                    className="w-full py-3 bg-white text-blue-600 rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                    onClick={() => window.location.href = `mailto:${loan.assignedLoanPartner?.email}`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    Email Partner
                                </button>
                                {loan.assignedLoanPartner.phone && (
                                    <button 
                                        className="w-full py-3 bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        onClick={() => window.location.href = `tel:${loan.assignedLoanPartner?.phone}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        Call Partner
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
