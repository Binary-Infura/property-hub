'use client';

import { useState } from 'react';

// Reusing types roughly for simplicity
interface Visit {
    id: string;
    clientName: string;
    propertyTitle: string;
    location: string;
    scheduledTime: string;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'no-show';
    feedback?: { rating: number; comment: string };
}

export default function VisitsPage() {
    const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all');

    // Mock Data
    const visits: Visit[] = [
        {
            id: 'v1',
            clientName: 'Rahul Sharma',
            propertyTitle: 'Sunset Heights, 3BHK',
            location: 'Andheri West, Mumbai',
            scheduledTime: new Date(new Date().setHours(14, 0)).toISOString(),
            status: 'scheduled',
        },
        {
            id: 'v4',
            clientName: 'Priya Singh',
            propertyTitle: 'Skyline Towers, 4BHK',
            location: 'Bandra, Mumbai',
            scheduledTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
            status: 'completed',
            feedback: { rating: 5, comment: 'Great service!' }
        },
        {
            id: 'v5',
            clientName: 'Vikram Malhotra',
            propertyTitle: 'Green Valley, Villa 4',
            location: 'Powai, Mumbai',
            scheduledTime: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
            status: 'cancelled',
        }
    ];

    const filteredVisits = visits.filter(v => filter === 'all' || v.status === filter);

    const getStatusColor = (status: Visit['status']) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            case 'ongoing': return 'bg-yellow-100 text-yellow-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'no-show': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Visits</h1>
                    <p className="text-gray-600 mt-2">History of all your scheduled and completed visits.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    + Log Ad-hoc Visit
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex p-1">
                    {['all', 'scheduled', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition capitalize ${filter === f ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredVisits.map((visit) => (
                                <tr key={visit.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>{new Date(visit.scheduledTime).toLocaleDateString()}</div>
                                        <div className="text-gray-500 text-xs">{new Date(visit.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {visit.clientName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="text-gray-900 font-medium">{visit.propertyTitle}</div>
                                        <div className="text-xs">{visit.location}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(visit.status)}`}>
                                            {visit.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button className="text-blue-600 hover:text-blue-900 font-medium">View Details</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredVisits.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No visits found matching your filter.
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
