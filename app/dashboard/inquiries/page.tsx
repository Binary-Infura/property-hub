'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function InquiriesPage() {
    const { token } = useAuth();
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInquiries = async () => {
            if (!token) return;
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/leads`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch inquiries');
                const data = await response.json();
                setInquiries(data);
            } catch (error) {
                console.error("Failed to fetch inquiries:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInquiries();
    }, [token]);

    const stats = {
        pending: inquiries.filter(i => i.status === 'NEW' || i.status === 'CONTACTED').length,
        active: inquiries.filter(i => i.status === 'FOLLOW_UP' || i.status === 'SITE_VISIT_SCHEDULED' || i.status === 'SITE_VISIT_DONE').length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Your Inquiries</h1>
                    <p className="text-gray-500 mt-1">Track the status of your property inquiries and next steps.</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg text-xs font-bold border border-yellow-100 flex items-center">
                        {stats.pending} Pending
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100 flex items-center">
                        {stats.active} Active
                    </span>
                </div>
            </div>

            {inquiries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No inquiries yet</h2>
                    <p className="text-gray-500 mb-6">Start by inquiring about properties you're interested in.</p>
                    <a href="/dashboard/search" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                        Explore properties
                    </a>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Property</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date Submitted</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Consultant</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {inquiries.map((inquiry) => (
                                    <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-6">
                                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{inquiry.project?.name || 'Inquiry'}</p>
                                            <p className="text-xs text-gray-500 mt-1">Ref ID: {inquiry.id.slice(-6).toUpperCase()}</p>
                                        </td>
                                        <td className="px-6 py-6 text-sm text-gray-600">
                                            {new Date(inquiry.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-6 font-bold">
                                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border ${['NEW', 'CONTACTED'].includes(inquiry.status)
                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                    : ['FOLLOW_UP', 'SITE_VISIT_SCHEDULED', 'SITE_VISIT_DONE'].includes(inquiry.status)
                                                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                        : 'bg-green-50 text-green-700 border-green-100'
                                                }`}>
                                                {inquiry.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            {inquiry.assignedToUser ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black">
                                                        {inquiry.assignedToUser.firstName[0]}{inquiry.assignedToUser.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{inquiry.assignedToUser.firstName} {inquiry.assignedToUser.lastName}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Managing Consultant</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 font-bold italic">Assigning expert...</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <button className="text-gray-400 hover:text-blue-600 p-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-8 bg-blue-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-200">
                <div>
                    <h3 className="text-xl font-bold mb-2">Need Immediate Assistance?</h3>
                    <p className="text-blue-100 opacity-90">Our experts are available 24/7 to help with your property inquiries.</p>
                </div>
                <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition whitespace-nowrap">
                    Contact Express Support
                </button>
            </div>
        </div>
    );
}
