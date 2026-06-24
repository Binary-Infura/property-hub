"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { userService, User } from '@/app/services/userService';
import { cityService, City } from '@/app/services/cityService';
import { loanService } from '@/app/services/loanService';
import { useAuth } from '@/app/contexts/AuthContext';
import BuyerLoanSubmitModal from '@/app/components/buyer/BuyerLoanSubmitModal';

export default function LoanAdvisorSelectionPage() {
    const searchParams = useSearchParams();
    const projectIdFromQuery = searchParams.get('projectId') || searchParams.get('propertyId');
    const { token, activeRole } = useAuth();
    const router = useRouter();

    const [advisors, setAdvisors] = useState<User[]>([]);
    const [filteredAdvisors, setFilteredAdvisors] = useState<User[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState('');

    // active loans
    const [myLoans, setMyLoans] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    const [selectedLoanPartnerId, setSelectedLoanPartnerId] = useState<string | null>(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    const isBuyer = activeRole === 'BUYER';

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                setLoading(true);
                const [usersData, citiesData, loansData] = await Promise.all([
                    userService.getAllByRole('LOAN_PARTNER', token, false, 1, 100),
                    cityService.getAll(token).catch(() => []),
                    loanService.getLoans(token).catch(() => []) // Active applications
                ]);

                setAdvisors(usersData.data || []);
                setFilteredAdvisors(usersData.data || []);
                setCities(citiesData || []);
                setMyLoans(loansData || []);

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    useEffect(() => {
        if (selectedCity) {
            setFilteredAdvisors(advisors.filter(a => {
                const isAssigned = a.cityAllocations?.some((alloc: any) => alloc.city.name === selectedCity || alloc.city.id === selectedCity);
                return isAssigned || !a.cityAllocations || a.cityAllocations.length === 0;
            }));
        } else {
            setFilteredAdvisors(advisors);
        }
    }, [selectedCity, advisors]);

    const handleApplyClick = (loanPartnerId?: string) => {
        if (loanPartnerId) {
            setSelectedLoanPartnerId(loanPartnerId);
        } else {
            setIsApplyModalOpen(true);
        }
    };

    const handleLoanSuccess = async () => {
        setSelectedLoanPartnerId(null);
        setIsApplyModalOpen(false);
        if (!token) return;
        try {
            const data = await loanService.getLoans(token);
            setMyLoans(data);
        } catch (error) { }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {isBuyer ? 'Loan Applications' : 'Financial Experts'}
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium max-w-2xl">
                        {isBuyer 
                            ? 'Manage your loan applications and track their status in real-time.' 
                            : 'Connect with top-rated loan partners in your area to get the best interest rates.'
                        }
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {isBuyer && (
                        <button 
                            onClick={() => handleApplyClick()}
                            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95 whitespace-nowrap"
                        >
                            Apply For Loan
                        </button>
                    )}
                    
                    {!isBuyer && (
                        <div className="w-full md:w-72 shrink-0">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Location</label>
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-semibold text-gray-700 shadow-sm"
                            >
                                <option value="">All Cities</option>
                                {cities.map((city: City) => (
                                    <option key={city.id} value={city.id}>
                                        {city.cityName || city.name} {city.stateCode ? `(${city.stateCode})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* My Applications Section (Visible to Buyers) */}
            {isBuyer && (
                <div className="space-y-6">
                    {myLoans.length === 0 ? (
                        <div className="py-20 text-center bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">No Applications Found</h3>
                            <p className="text-gray-500 mt-1">You haven't applied for any loans yet.</p>
                            <button 
                                onClick={() => handleApplyClick()}
                                className="mt-6 text-blue-600 font-bold hover:underline"
                            >
                                Apply your first loan now
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {myLoans.map((loan) => (
                                <div key={loan.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                                            {loan.bank?.name?.charAt(0) || 'B'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{loan.bank?.name || 'Bank Partner'}</h4>
                                            <p className="text-sm text-gray-500">Amount: ₹{loan.loanAmount?.toLocaleString()}</p>
                                            {loan.lead?.project?.name && (
                                                <div className="mt-1 flex items-center gap-1.5">
                                                    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-xs font-bold text-blue-600">{loan.lead.project.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                                            loan.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                                            loan.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-100'
                                        }`}>
                                            {loan.status}
                                        </span>
                                        <div className="text-xs text-gray-400 font-medium">
                                            Applied on {new Date(loan.createdAt).toLocaleDateString()}
                                        </div>
                                        <button 
                                            onClick={() => router.push(`/dashboard/loan/${loan.id}`)}
                                            className="ml-4 text-blue-600 font-bold text-sm hover:underline"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Financial Experts Section (Visible to other roles or if specifically requested) */}
            {!isBuyer && (
                <>
                    {myLoans.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 mb-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">Active Loan Applications</h3>
                                <p className="opacity-80 text-sm mt-1">You have {myLoans.length} active application(s) in progress.</p>
                            </div>
                            <button
                                className="bg-white text-blue-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition active:scale-95 whitespace-nowrap"
                                onClick={() => router.push('/dashboard/loan/applications')}
                            >
                                View Status
                            </button>
                        </div>
                    )}

                    {filteredAdvisors.length === 0 ? (
                        <div className="py-20 text-center bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">No advisors found</h3>
                            <p className="text-gray-500 mt-1">Try changing your city filter or check back later.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAdvisors.map(advisor => {
                                const name = `${advisor.firstName || ''} ${advisor.lastName || ''}`.trim() || 'Loan Partner';
                                const initials = (advisor.firstName?.[0] || '') + (advisor.lastName?.[0] || '');

                                return (
                                    <div key={advisor.id} className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-14 h-14 bg-blue-100 text-blue-700 font-bold text-lg rounded-2xl flex items-center justify-center shadow-inner uppercase">
                                                    {initials || 'LA'}
                                                </div>
                                                <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                    Available
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{name}</h3>
                                            <p className="text-sm text-gray-500 mb-4">{advisor.email}</p>

                                            <div className="space-y-2 mb-6 text-sm">
                                                <div className="flex items-center text-gray-600 gap-2">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                    <span className="font-medium">{advisor.phone || 'Contact via Platform'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleApplyClick(advisor.id)}
                                            className="w-full bg-slate-50 text-blue-600 border border-blue-100 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 group-hover:shadow-blue-200"
                                        >
                                            Select & Apply
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {(selectedLoanPartnerId || isApplyModalOpen) && (
                <BuyerLoanSubmitModal
                    isOpen={true}
                    onClose={() => {
                        setSelectedLoanPartnerId(null);
                        setIsApplyModalOpen(false);
                    }}
                    loanPartnerId={selectedLoanPartnerId || ''}
                    projectId={projectIdFromQuery || undefined}
                    onSuccess={handleLoanSuccess}
                />
            )}
        </div>
    );
}
