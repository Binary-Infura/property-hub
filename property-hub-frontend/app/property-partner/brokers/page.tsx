'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { userService } from '@/app/services/userService';
import PremiumLockedOverlay from '@/app/components/property-partner/PremiumLockedOverlay';

interface Broker {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    reraId?: string;
    createdAt?: string;
    profileData?: {
        brokerType?: string;
        agencyName?: string;
    } | null;
    brokerProfile?: {
        agencyBusinessName: string;
        reraNumber?: string;
        officeAddress?: string;
    } | null;
    organization?: {
        name: string;
        type: string;
    } | null;
}

export default function AllBrokersPage() {
    const { token, profileStatus } = useAuth();
    const isPremium = profileStatus?.['PROPERTY_PARTNER']?.profileData?.isPremium;
    const [brokers, setBrokers] = useState<Broker[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        agencyName: '',
        reraId: '',
        brokerType: 'INDIVIDUAL',
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

    const fetchBrokers = async () => {
        if (!token || !isPremium) return;
        try {
            const response = await fetch(`${API_URL}/api/property-partners/brokers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBrokers(data);
            }
        } catch (error) {
            console.error('Failed to fetch brokers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrokers();
    }, [token, API_URL]);

    const handleAddBroker = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/property-partners/brokers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setShowAddModal(false);
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    agencyName: '',
                    reraId: '',
                    brokerType: 'INDIVIDUAL',
                });
                fetchBrokers();
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to add broker');
            }
        } catch (error) {
            console.error('Error adding broker:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = brokers.filter((b) => {
        const q = search.toLowerCase();
        const agency = b.profileData?.agencyName || b.brokerProfile?.agencyBusinessName || '';
        const rera = b.reraId || b.brokerProfile?.reraNumber || '';
        return (
            b.firstName.toLowerCase().includes(q) ||
            b.lastName.toLowerCase().includes(q) ||
            b.email.toLowerCase().includes(q) ||
            agency.toLowerCase().includes(q) ||
            rera.toLowerCase().includes(q)
        );
    });
    
    if (!isPremium) {
        return <PremiumLockedOverlay title="Brokers Network" description="Manage and track your authorized brokers, monitor their performance and manage RERA details." />;
    }
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">Brokers Network</h1>
                    <p className="text-gray-600 mt-1">
                        {brokers.length} broker{brokers.length !== 1 ? 's' : ''} in your network
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Broker
                </button>

                {/* Search */}
                <div className="relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search brokers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all w-56"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Broker</th>
                                <th className="px-4 py-3">Agency</th>
                                <th className="px-4 py-3">RERA Number</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3 text-right">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((broker) => (
                                <tr key={broker.id} className="text-sm hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 py-4">
                                        <p className="font-bold text-gray-900">
                                            {broker.firstName} {broker.lastName}
                                        </p>
                                        <p className="text-xs text-gray-400">{broker.email}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="font-medium text-gray-800">
                                            {broker.organization?.name || broker.profileData?.agencyName || broker.brokerProfile?.agencyBusinessName || (
                                                <span className="text-gray-400 italic">Individual</span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        {(broker.reraId || broker.brokerProfile?.reraNumber) ? (
                                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold font-mono">
                                                {broker.reraId || broker.brokerProfile?.reraNumber}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Not set</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 text-xs">
                                        {broker.phone || <span className="text-gray-400 italic">—</span>}
                                    </td>
                                    <td className="px-4 py-4 text-right text-xs text-gray-400">
                                        {broker.createdAt
                                            ? new Date(broker.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center">
                                        <p className="text-gray-400 italic">
                                            {search ? `No brokers matching "${search}"` : 'No brokers onboarded yet.'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 border border-white/20">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <div>
                        <h2 className="text-xl font-black text-slate-900">Add New Broker</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Directly add a broker to your network</p>
                      </div>
                      <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-all hover:rotate-90">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <form onSubmit={handleAddBroker} className="p-6 space-y-4">
                      {/* Broker Type Selection */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Broker Type</label>
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, brokerType: 'INDIVIDUAL', agencyName: ''})}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.brokerType === 'INDIVIDUAL' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            Individual
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, brokerType: 'ORGANIZATION'})}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.brokerType === 'ORGANIZATION' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            Organization
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700 ml-1">First Name *</label>
                          <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 text-sm placeholder:text-gray-400" placeholder="John" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                          <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 text-sm placeholder:text-gray-400" placeholder="Doe" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address *</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 text-sm placeholder:text-gray-400" placeholder="john@example.com" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                        <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 text-sm placeholder:text-gray-400" placeholder="+91 98765 43210" />
                      </div>

                      {formData.brokerType === 'ORGANIZATION' ? (
                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 ml-1">Agency Name *</label>
                            <input required={formData.brokerType === 'ORGANIZATION'} type="text" value={formData.agencyName} onChange={e => setFormData({...formData, agencyName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 text-sm placeholder:text-gray-400" placeholder="Agency LLC" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 ml-1">RERA ID</label>
                            <input type="text" value={formData.reraId} onChange={e => setFormData({...formData, reraId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 text-sm placeholder:text-gray-400" placeholder="RERA123" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                          <label className="text-sm font-bold text-slate-700 ml-1">RERA ID (Optional)</label>
                          <input type="text" value={formData.reraId} onChange={e => setFormData({...formData, reraId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 text-sm placeholder:text-gray-400" placeholder="RERA123" />
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-4 font-black tracking-widest uppercase text-slate-400 border-2 border-slate-100 hover:bg-slate-50 rounded-2xl transition-all text-xs w-1/3">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-6 py-4 font-black tracking-widest uppercase text-white bg-slate-900 hover:bg-slate-800 rounded-2xl transition-all shadow-xl shadow-slate-200 flex-[2] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs">
                          {submitting ? 'Adding...' : 'Add Broker'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
            )}
        </div>
    );
}
