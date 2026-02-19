'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import PremiumLockedOverlay from '@/app/components/property-partner/PremiumLockedOverlay';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { userService, User } from '@/app/services/userService';
import AddServiceProviderForm from '@/app/components/service-provider/AddServiceProviderForm';

export default function ServiceProvidersPage() {
    const { token, profileStatus } = useAuth();
    const isPremium = profileStatus?.['property-partner']?.profileData?.isPremium;
    const { activeContext } = useUnifiedApp();
    const [serviceProviders, setServiceProviders] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<User | null>(null);

    const fetchProviders = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const result = await userService.getAllByRole(
                'service-provider',
                token,
                undefined,
                true // Always personal view
            );
            setServiceProviders(result.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch service providers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, [token]);

    const handleAddSubmit = async (data: any) => {
        if (!token) return;
        try {
            const payload = {
                ...data,
                role: 'service-provider',
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

    if (!isPremium) {
        return <PremiumLockedOverlay title="Service Providers" description="Build a reliable network of service providers to maintain and enhance your managed properties." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
                    <p className="text-gray-600 mt-1">Manage external vendors and agencies.</p>
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


            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name / Business</th>
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
                                            <button className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">Edit</button>
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
                                <p className="text-sm text-gray-500 mt-1">Register a new service provider.</p>
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
        </div>
    );
}
