'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import PremiumLockedOverlay from '@/app/components/property-partner/PremiumLockedOverlay';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    propertyTitle: string;
    status: 'new' | 'contacted' | 'visit-scheduled' | 'closed';
    createdAt: string;
}

export default function LeadsPage() {
    const { token, profileStatus } = useAuth();
    const isPremium = profileStatus?.['property-partner']?.profileData?.isPremium;
    const { activeContext } = useUnifiedApp();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            if (!token || !isPremium) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${API_URL}/api/leads`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setLeads(data);
                }
            } catch (error) {
                console.error('Failed to fetch leads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [token, isPremium]);

    if (!isPremium) {
        return <PremiumLockedOverlay title="Leads Management" description="Track and manage potential buyers, schedule visits, and close deals faster with our advanced tracking system." />;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
                    <p className="text-gray-600 mt-1">Track and manage potential buyers for your properties.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No leads found yet.
                                </td>
                            </tr>
                        ) : leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-700 font-bold">
                                            {lead.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900">{lead.name}</div>
                                            <div className="text-xs text-gray-500">{lead.email || lead.phone}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                    {lead.project?.name || 'Unknown Property'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                        lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(lead.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button className="text-blue-600 hover:text-blue-800 font-semibold">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
