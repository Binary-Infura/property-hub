'use client';

import { useState } from 'react';
import { ServiceProvider } from '@/app/types/service-provider';
import AddServiceProviderForm from '@/app/components/service-provider/AddServiceProviderForm';

export default function OnboardingServiceProvidersPage() {
    const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([
        {
            id: '1',
            name: 'Ramesh Gupta',
            businessName: 'Gupta Painting Services',
            email: 'ramesh@example.com',
            phone: '+91 98765 43210',
            category: 'painting',
            serviceArea: 'Mumbai, Bandra',
            availability: { days: ['Mon-Sat'], hours: '09:00 AM - 07:00 PM' },
            rates: '₹300/sqft',
            rating: 4.5,
            jobsCompleted: 12,
            status: 'active',
            joinedAt: new Date('2024-01-10'),
        },
        {
            id: '2',
            name: 'Suresh Electricals',
            email: 'suresh@example.com',
            phone: '+91 98765 12345',
            category: 'electrical',
            serviceArea: 'Mumbai, Andheri',
            availability: { days: ['Mon-Sat'], hours: '10:00 AM - 08:00 PM' },
            rates: 'Visit Charge ₹500',
            rating: 4.8,
            jobsCompleted: 35,
            status: 'pending-approval',
            joinedAt: new Date('2024-02-15'),
        },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);

    const handleAddSubmit = (data: any) => {
        const newProvider: ServiceProvider = {
            id: Date.now().toString(),
            ...data,
            availability: { days: data.availabilityDays || [], hours: data.availabilityHours || '' },
            rating: 0,
            jobsCompleted: 0,
            status: 'pending-approval', // Onboarding manager adds, Regional might approve? Or just active.
            joinedAt: new Date(),
        };
        setServiceProviders([...serviceProviders, newProvider]);
        setShowAddModal(false);
    };

    const handleAssign = (provider: ServiceProvider) => {
        setSelectedProvider(provider);
        setShowAssignModal(true);
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
                        <p className="text-gray-600 mt-1">Onboard and assign service providers</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Onboard New Provider
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Onboarded</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{serviceProviders.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Recently Added</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{serviceProviders.filter(sp => new Date().getTime() - sp.joinedAt.getTime() < 7 * 24 * 60 * 60 * 1000).length}</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name / Business</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {serviceProviders.map((sp) => (
                                    <tr key={sp.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{sp.businessName || sp.name}</p>
                                                <p className="text-xs text-gray-500">Joined: {sp.joinedAt.toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 capitalize text-gray-700">{sp.category}</td>
                                        <td className="py-4 px-4 text-gray-700">{sp.serviceArea}</td>
                                        <td className="py-4 px-4 text-gray-700">
                                            <div className="text-sm">
                                                <p>{sp.phone}</p>
                                                <p className="text-gray-500 text-xs">{sp.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${sp.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    sp.status === 'inactive' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {sp.status === 'active' ? 'Active' : sp.status === 'inactive' ? 'Inactive' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleAssign(sp)}
                                                    className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-sm font-medium"
                                                >
                                                    Assign
                                                </button>
                                                <button
                                                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                                                >
                                                    Edit Profile
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Onboard Service Provider</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>

                        <AddServiceProviderForm
                            onCancel={() => setShowAddModal(false)}
                            onSubmit={handleAddSubmit}
                        />
                    </div>
                </div>
            )}

            {/* Assign Modal (Mock) */}
            {showAssignModal && selectedProvider && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Assign {selectedProvider.name}</h2>
                        <p className="text-gray-600 mb-4">Assign this provider to a Property Partner or region.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Property Partner</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option>Select a builder...</option>
                                    <option>Property Partner A</option>
                                    <option>Property Partner B</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Region</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                    <option>Select a region...</option>
                                    <option>Mumbai North</option>
                                    <option>Mumbai South</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert(`Assigned ${selectedProvider.name} successfully!`);
                                    setShowAssignModal(false);
                                }}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
