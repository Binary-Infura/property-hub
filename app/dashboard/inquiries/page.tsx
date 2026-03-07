'use client';

import { useState } from 'react';

// Sample inquiries data
const inquiries = [
    {
        id: 1,
        property: "Sunset Towers, Bandra",
        date: "2024-02-15",
        status: "in-progress",
        lastUpdate: "Consultant assigned: Rajesh Sharma",
        nextStep: "Site visit scheduled for Feb 20th"
    },
    {
        id: 2,
        property: "Green Valley Homes, Powai",
        date: "2024-02-10",
        status: "pending",
        lastUpdate: "Inquiry received",
        nextStep: "Waiting for consultant assignment"
    },
    {
        id: 3,
        property: "Luxury Villa, Alibaug",
        date: "2024-01-28",
        status: "completed",
        lastUpdate: "Information pack sent",
        nextStep: "Follow up call completed"
    }
];

export default function InquiriesPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Your Inquiries</h1>
                    <p className="text-gray-500 mt-1">Track the status of your property inquiries and next steps.</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg text-xs font-bold border border-yellow-100 flex items-center">
                        1 Pending
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100 flex items-center">
                        2 Active
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Property</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date Submitted</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Latest Update</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {inquiries.map((inquiry) => (
                                <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-6">
                                        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{inquiry.property}</p>
                                        <p className="text-xs text-gray-500 mt-1">Ref ID: PH-{1000 + inquiry.id}</p>
                                    </td>
                                    <td className="px-6 py-6 text-sm text-gray-600">
                                        {new Date(inquiry.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-6 font-bold">
                                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border ${inquiry.status === 'in-progress'
                                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                : inquiry.status === 'pending'
                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                    : 'bg-green-50 text-green-700 border-green-100'
                                            }`}>
                                            {inquiry.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="text-sm text-gray-700 font-medium">{inquiry.lastUpdate}</p>
                                        <p className="text-xs text-blue-600 mt-1 font-bold">{inquiry.nextStep}</p>
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
