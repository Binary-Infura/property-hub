'use client';

import { useState } from 'react';

interface Property {
    id: string;
    title: string;
    location: string;
}

interface AdRequest {
    id: string;
    propertyId: string;
    propertyTitle: string;
    promotionType: string;
    budget: string;
    duration: string;
    notes: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Live';
    submittedAt: Date;
}

export default function AdvertisementRequestsPage() {
    // Mock Data
    const properties: Property[] = [
        { id: '1', title: 'Sunset Towers, Bandra', location: 'Bandra, Mumbai' },
        { id: '2', title: 'Green Valley Homes, Powai', location: 'Powai, Mumbai' },
        { id: '3', title: 'Ocean View Residency', location: 'Worli, Mumbai' },
    ];

    const [requests, setRequests] = useState<AdRequest[]>([
        {
            id: '101',
            propertyId: '1',
            propertyTitle: 'Sunset Towers, Bandra',
            promotionType: 'Social Media Campaign',
            budget: '₹50,000',
            duration: '7 Days',
            notes: 'Focus on luxury amenities',
            status: 'Live',
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
            id: '102',
            propertyId: '2',
            propertyTitle: 'Green Valley Homes, Powai',
            promotionType: 'Property Portal Boosting',
            budget: '₹25,000',
            duration: '14 Days',
            notes: 'Target family buyers',
            status: 'Pending',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
    ]);

    const [form, setForm] = useState({
        propertyId: '',
        promotionType: 'Social Media Campaign',
        budget: '',
        duration: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedProperty = properties.find(p => p.id === form.propertyId);
        if (!selectedProperty) return;

        const newRequest: AdRequest = {
            id: Date.now().toString(),
            propertyId: form.propertyId,
            propertyTitle: selectedProperty.title,
            promotionType: form.promotionType,
            budget: form.budget,
            duration: form.duration,
            notes: form.notes,
            status: 'Pending',
            submittedAt: new Date(),
        };

        setRequests([newRequest, ...requests]);
        setForm({
            propertyId: '',
            promotionType: 'Social Media Campaign',
            budget: '',
            duration: '',
            notes: '',
        });
        alert('Advertisement request submitted successfully!');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Approved': return 'bg-blue-100 text-blue-800';
            case 'Live': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Advertisement Requests</h1>
                        <p className="text-gray-600 mt-1">Submit and track property promotion campaigns</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Request Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Request</h2>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Property</label>
                            <select
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                value={form.propertyId}
                                onChange={e => setForm({ ...form, propertyId: e.target.value })}
                            >
                                <option value="">-- Select Property --</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.title} - {p.location}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Type</label>
                            <select
                                required
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                value={form.promotionType}
                                onChange={e => setForm({ ...form, promotionType: e.target.value })}
                            >
                                <option>Social Media Campaign</option>
                                <option>Property Portal Boosting</option>
                                <option>Email Marketing</option>
                                <option>Print Advertisement</option>
                                <option>Video Production</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 50,000"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                value={form.budget}
                                onChange={e => setForm({ ...form, budget: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 7 Days, 1 Month"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                value={form.duration}
                                onChange={e => setForm({ ...form, duration: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes / Strategy</label>
                            <textarea
                                rows={3}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                placeholder="Describe target audience, key selling points, etc."
                                value={form.notes}
                                onChange={e => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>

                {/* Requests List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-900">Request History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{req.propertyTitle}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {req.promotionType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {req.budget}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {req.submittedAt.toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                            {req.status === 'Live' && (
                                                <a href="/dsa/dashboard/campaigns-leads" className="text-blue-600 hover:text-blue-800 text-xs ml-2 underline">
                                                    View Campaign
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
