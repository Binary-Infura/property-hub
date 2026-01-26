'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { userService, User } from '@/app/services/userService';

export default function OnboardingManagersPage() {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const [managers, setManagers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedManager, setSelectedManager] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const fetchManagers = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await userService.getAllByRole('property-onboarding-manager', token);
            setManagers(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch managers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManagers();
    }, [token]);

    const handleAddManager = () => {
        setFormData({ name: '', email: '', phone: '' });
        setShowAddModal(true);
    };

    const handleEditManager = (manager: User) => {
        setFormData({
            name: manager.name,
            email: manager.email,
            phone: manager.phone || '',
        });
        setSelectedManager(manager);
        setShowEditModal(true);
    };

    const handleSaveManager = async () => {
        if (!token) return;
        try {
            if (selectedManager) {
                const updated = await userService.update(selectedManager.id, {
                    ...formData,
                    regionIds: activeContext.activeRegion.id !== 'no-region' ? [activeContext.activeRegion.id] : []
                }, token);
                setManagers(managers.map(m => m.id === selectedManager.id ? updated : m));
                setShowEditModal(false);
            } else {
                const created = await userService.create({
                    ...formData,
                    role: 'property-onboarding-manager',
                    regionIds: activeContext.activeRegion.id !== 'no-region' ? [activeContext.activeRegion.id] : []
                }, token);
                setManagers([created, ...managers]);
                setShowAddModal(false);
            }
            setFormData({ name: '', email: '', phone: '' });
            setSelectedManager(null);
        } catch (err: any) {
            alert(err.message || 'Failed to save manager');
        }
    };

    const handleToggleStatus = async (id: string) => {
        if (!token) return;
        try {
            const updated = await userService.toggleStatus(id, token);
            setManagers(managers.map(m => m.id === id ? updated : m));
        } catch (err: any) {
            alert(err.message || 'Failed to toggle status');
        }
    };

    const activeCount = managers.filter(m => m.status === 'active').length;

    if (loading && managers.length === 0) {
        return <div className="p-8">Loading onboarding managers...</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Property Onboarding Managers</h1>
                    <p className="text-gray-600 mt-2">Manage managers responsible for onboarding properties and partners.</p>
                </div>
                <button
                    onClick={handleAddManager}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
                >
                    <span>+</span> Add New Manager
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region(s)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {managers.map((manager) => (
                            <tr key={manager.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                            {manager.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                                            <div className="text-xs text-gray-500">Joined {new Date(manager.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{manager.email}</div>
                                    <div className="text-sm text-gray-500">{manager.phone || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        {manager.regions?.map(r => r.name).join(', ') || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">N/A Properties</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${manager.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {manager.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEditManager(manager)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(manager.id)}
                                        className={`${manager.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                    >
                                        {manager.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {showEditModal ? 'Edit Onboarding Manager' : 'Add New Onboarding Manager'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    disabled={showEditModal}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                    setFormData({ name: '', email: '', phone: '' });
                                }}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveManager}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                {showEditModal ? 'Save Changes' : 'Add Manager'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
