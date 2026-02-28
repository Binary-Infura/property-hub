'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

interface PropertyPartner {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    agencyName: string;
    propertyPartnerProfile: {
        isPremium: boolean;
        subscriptionMode: 'PAID' | 'FREE';
    } | null;
}

export default function AllPropertyPartnersPage() {
    const { token } = useAuth();
    const [partners, setPartners] = useState<PropertyPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingPartner, setUpdatingPartner] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchPartners = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/central-authority/property-partners`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPartners(data);
            }
        } catch (error) {
            console.error('Failed to fetch partners:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [token, API_URL]);

    const handleUpdateSubscription = async (userId: string, isPremium: boolean, mode: 'PAID' | 'FREE') => {
        setUpdatingPartner(userId);
        try {
            const response = await fetch(`${API_URL}/api/central-authority/property-partners/${userId}/subscription`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isPremium, subscriptionMode: mode })
            });

            if (response.ok) {
                await fetchPartners();
            } else {
                alert('Failed to update subscription');
            }
        } catch (error) {
            console.error('Error updating subscription:', error);
            alert('Error updating subscription');
        } finally {
            setUpdatingPartner(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/central-authority/dashboard"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Property Partners</h1>
                    <p className="text-gray-600 mt-1">Manage platform-wide property partner subscriptions</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Partner Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Agency</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Mode</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {partners.map((partner) => {
                                const isPremium = partner.propertyPartnerProfile?.isPremium || false;
                                const mode = partner.propertyPartnerProfile?.subscriptionMode || 'PAID';

                                return (
                                    <tr key={partner.id} className="text-sm group hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 font-bold text-gray-900">
                                            {partner.firstName} {partner.lastName}
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">{partner.email}</td>
                                        <td className="px-4 py-4 text-gray-600">{partner.agencyName || '-'}</td>
                                        <td className="px-4 py-4">
                                            {isPremium ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Premium</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Standard</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${mode === 'FREE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {mode}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {!isPremium ? (
                                                <button
                                                    onClick={() => handleUpdateSubscription(partner.id, true, 'FREE')}
                                                    disabled={updatingPartner === partner.id}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                                >
                                                    {updatingPartner === partner.id ? 'Updating...' : 'Mark Free Premium'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpdateSubscription(partner.id, false, 'PAID')}
                                                    disabled={updatingPartner === partner.id}
                                                    className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50"
                                                >
                                                    {updatingPartner === partner.id ? 'Updating...' : 'Revoke Premium'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {partners.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                                        No property partners found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
