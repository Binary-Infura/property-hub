'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoanStatusPage() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get('propertyId');

    const loanApps: Record<string, any> = {
        '1': {
            property: 'Sunset Towers, Bandra',
            amount: '₹85L',
            roi: '8.4%',
            tenure: '20 Yrs',
            status: 'In Progress',
            timeline: [
                { title: 'Profile Evaluation', date: 'Jan 15, 2024', status: 'completed', desc: 'Financial profile reviewed and verified.' },
                { title: 'Pre-Approval Letter', date: 'Jan 18, 2024', status: 'completed', desc: 'Offer letter generated based on current income.' },
                { title: 'Property Valuation', date: 'Jan 25, 2024', status: 'current', desc: 'Awaiting property documents for final valuation.' },
                { title: 'Legal Verification', date: 'Pending', status: 'upcoming', desc: 'Final legal check of property title.' },
                { title: 'Disbursement', date: 'Pending', status: 'upcoming', desc: 'Funds transfer to seller.' },
            ]
        },
        '2': {
            property: 'Green Valley Homes, Powai',
            amount: '₹52L',
            roi: '8.2%',
            tenure: '15 Yrs',
            status: 'Approved',
            timeline: [
                { title: 'Profile Evaluation', date: 'Feb 05, 2024', status: 'completed', desc: 'Financial profile reviewed.' },
                { title: 'Pre-Approval Letter', date: 'Feb 10, 2024', status: 'completed', desc: 'Offer letter generated.' },
                { title: 'Property Valuation', date: 'Feb 15, 2024', status: 'completed', desc: 'Property inspection successful.' },
                { title: 'Legal Verification', date: 'Feb 20, 2024', status: 'current', desc: 'Verifying society NOC and title deed.' },
                { title: 'Disbursement', date: 'Pending', status: 'upcoming', desc: 'Funds transfer to seller.' },
            ]
        }
    };

    const activeApp = propertyId && loanApps[propertyId] ? loanApps[propertyId] : loanApps['1'];

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">Finance Hub</p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                        Loan for <span className="text-blue-600">{activeApp.property}</span>
                    </h1>
                </div>
                <div className="bg-green-50 text-green-700 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-green-100 flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                    Application Active
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Loan Amount</p>
                    <p className="text-3xl font-black text-slate-900">{activeApp.amount}</p>
                    <div className="h-1.5 w-12 bg-blue-600 rounded-full mt-4"></div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Locked ROI</p>
                    <p className="text-3xl font-black text-slate-900">{activeApp.roi}</p>
                    <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">Floating Rate</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tenure</p>
                    <p className="text-3xl font-black text-slate-900">{activeApp.tenure}</p>
                    <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">Fixed Period 2y</p>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="p-10 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-black text-white tracking-tight">Application Timeline</h2>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Step 3 of 5</span>
                </div>
                <div className="p-12">
                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-800"></div>
                        <div className="space-y-12">
                            {activeApp.timeline.map((step: any, idx: number) => (
                                <div key={idx} className="relative flex items-start gap-10">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${step.status === 'completed' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : step.status === 'current' ? 'bg-white text-blue-600 shadow-xl scale-125' : 'bg-slate-800 text-slate-600'}`}>
                                        {step.status === 'completed' ? (
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <span className="text-xs font-black">{idx + 1}</span>
                                        )}
                                    </div>
                                    <div className="pt-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className={`font-black uppercase tracking-widest text-[12px] ${step.status === 'upcoming' ? 'text-slate-600' : 'text-white'}`}>{step.title}</h3>
                                            <span className="text-[10px] font-bold text-slate-500">{step.date}</span>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${step.status === 'upcoming' ? 'text-slate-700' : 'text-slate-400'}`}>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Support CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-md text-center md:text-left">
                    <h2 className="text-3xl font-black tracking-tighter mb-4">Want a faster approval?</h2>
                    <p className="text-blue-100 font-bold opacity-80 leading-relaxed">Our finance specialist is waiting to fast-track your application with the bank manager.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl hover:bg-blue-50 transition active:scale-95">
                        Priority Call
                    </button>
                    <button className="bg-blue-500/20 border border-white/20 text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white/10 transition active:scale-95">
                        Bank Details
                    </button>
                </div>
            </div>
        </div>
    );
}
