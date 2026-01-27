'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { userService, User } from '@/app/services/userService';
import AddServiceProviderForm from '@/app/components/service-provider/AddServiceProviderForm';

export default function OnboardingServiceProvidersPage() {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const [serviceProviders, setServiceProviders] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

    const fetchProviders = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await userService.getAllByRole(
                'service-provider',
                token,
                activeContext.activeRegion.code !== 'no-region' ? activeContext.activeRegion.code : undefined,
                activeTab === 'my'
            );
            setServiceProviders(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch service providers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, [token, activeContext.activeRegion.code, activeTab]);

    const handleAddSubmit = async (data: any) => {
        if (!token) return;
        try {
            const payload = {
                ...data,
                role: 'service-provider',
                regionIds: activeContext.activeRegion.id !== 'no-region' ? [activeContext.activeRegion.id] : [],
            };
            await userService.create(payload, token);
            fetchProviders();
            setShowAddModal(false);
        } catch (err: any) {
            alert(err.message || 'Failed to add service provider');
        }
    };

    const handleAssign = (provider: User) => {
        setSelectedProvider(provider);
        setShowAssignModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
                    <p className="text-gray-600 mt-1">Onboard and assign service providers across regions.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Onboard New Provider
                </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">Total Onboarded</p>
                    <p className="text-4xl font-black text-gray-900 mt-2">{serviceProviders.length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">Recently Added (7d)</p>
                    <p className="text-4xl font-black text-blue-600 mt-2">{serviceProviders.filter(sp => new Date().getTime() - new Date(sp.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000).length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100/50 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('my')}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'my'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    My Onboardings
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'all'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    All Providers ({activeContext.activeRegion.name})
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name / Business</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Onboarded By</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading providers...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : serviceProviders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                        No service providers found.
                                    </td>
                                </tr>
                            ) : serviceProviders.map((sp) => (
                                <tr key={sp.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold text-gray-900">{sp.agencyName || sp.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{sp.role || 'Service'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-700">{sp.regions?.[0]?.name || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <p className="text-sm font-medium text-gray-900">{sp.phone}</p>
                                            <p className="text-xs text-gray-500">{sp.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-900 font-medium">{(sp as any).onboardedBy?.name || 'Unknown'}</span>
                                            <span className="text-xs text-gray-500">{new Date(sp.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sp.status === 'active' ? 'bg-green-100 text-green-700' :
                                            sp.status === 'inactive' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {sp.status === 'active' ? 'Active' : sp.status === 'inactive' ? 'Inactive' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => handleAssign(sp)}
                                                className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
                                            >
                                                Assign
                                            </button>
                                            {activeTab === 'my' && (
                                                <button className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">Edit</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Onboard Service Provider</h2>
                                <p className="text-sm text-gray-500 mt-1">Register a new service provider to your region.</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <AddServiceProviderForm
                                onCancel={() => setShowAddModal(false)}
                                onSubmit={handleAddSubmit}
                            />
                        </div>
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
