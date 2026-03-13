'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

interface Organization {
    id: string;
    name: string;
    type: string;
    email: string | null;
    phone: string | null;
    isPremium: boolean;
    subscriptionMode: string;
    isActive: boolean;
    createdAt: string;
    _count: {
        members: number;
    };
}

export default function OrganizationsPage() {
    const { token } = useAuth();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchOrganizations = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/central-authority/organizations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setOrganizations(data);
            }
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, [token, API_URL]);

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
                    <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
                    <p className="text-gray-600 mt-1">Platform-wide organization management</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Organization Name</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Members</th>
                                <th className="px-4 py-3">Premium Status</th>
                                <th className="px-4 py-3">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {organizations.map((org) => {
                                return (
                                    <tr key={org.id} className="text-sm group hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <p className="font-bold text-gray-900">{org.name}</p>
                                            <p className="text-xs text-gray-400">{org.email || 'No email'}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                                {org.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-600 font-medium">
                                            {org._count.members} Members
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-1">
                                                {org.isPremium ? (
                                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit">Premium</span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit">Standard</span>
                                                )}
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit ${org.subscriptionMode === 'FREE' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {org.subscriptionMode}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-gray-400 text-xs">
                                            {new Date(org.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })}
                            {organizations.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                                        No organizations found in the system.
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
