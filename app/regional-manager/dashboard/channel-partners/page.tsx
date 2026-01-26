'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { userService, User } from '@/app/services/userService';

export default function ChannelPartnersPage() {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const [partners, setPartners] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        agencyName: '',
        reraId: '',
    });

    const fetchPartners = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await userService.getAllByRole('channel-partner', token);
            setPartners(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch partners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [token]);

    const handleAddPartner = () => {
        setFormData({ name: '', email: '', phone: '', agencyName: '', reraId: '' });
        setShowAddModal(true);
    };

    const handleEditPartner = (partner: User) => {
        setFormData({
            name: partner.name,
            email: partner.email,
            phone: partner.phone || '',
            agencyName: partner.agencyName || '',
            reraId: partner.reraId || '',
        });
        setSelectedPartner(partner);
        setShowEditModal(true);
    };

    const handleSavePartner = async () => {
        if (!token) return;
        try {
            if (selectedPartner) {
                // Edit existing
                const updated = await userService.update(selectedPartner.id, {
                    ...formData,
                    regionIds: activeContext.activeRegion.id !== 'no-region' ? [activeContext.activeRegion.id] : []
                }, token);
                setPartners(partners.map(p => p.id === selectedPartner.id ? updated : p));
                setShowEditModal(false);
            } else {
                // Add new
                const created = await userService.create({
                    ...formData,
                    role: 'channel-partner',
                    regionIds: activeContext.activeRegion.id !== 'no-region' ? [activeContext.activeRegion.id] : []
                }, token);
                setPartners([created, ...partners]);
                setShowAddModal(false);
            }
            setFormData({ name: '', email: '', phone: '', agencyName: '', reraId: '' });
            setSelectedPartner(null);
        } catch (err: any) {
            alert(err.message || 'Failed to save partner');
        }
    };

    const handleToggleStatus = async (id: string) => {
        if (!token) return;
        try {
            const updated = await userService.toggleStatus(id, token);
            setPartners(partners.map(p => p.id === id ? updated : p));
        } catch (err: any) {
            alert(err.message || 'Failed to toggle status');
        }
    };

    const activeCount = partners.filter(p => p.status === 'active').length;

    if (loading && partners.length === 0) {
        return <div className="p-8">Loading channel partners...</div>;
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Channel Partners</h1>
                        <p className="text-gray-600 mt-1">Manage channel partners and their details</p>
                    </div>
                    <button
                        onClick={handleAddPartner}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Partner
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Partners</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{partners.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Active</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Agency Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">RERA ID</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {partners.map((partner) => (
                                    <tr key={partner.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{partner.name}</p>
                                                <p className="text-sm text-gray-500">{partner.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-gray-700">{partner.agencyName || 'N/A'}</td>
                                        <td className="py-4 px-4 text-gray-700">{partner.phone || 'N/A'}</td>
                                        <td className="py-4 px-4 text-gray-700 font-mono text-sm">{partner.reraId || 'N/A'}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${partner.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {partner.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditPartner(partner)}
                                                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(partner.id)}
                                                    className={`px-3 py-1 rounded text-sm font-medium ${partner.status === 'active'
                                                        ? 'text-red-600 hover:bg-red-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {partner.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {partners.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                            No channel partners found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal (Shared for Add/Edit) */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {showEditModal ? 'Edit Channel Partner' : 'Add New Channel Partner'}
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Agency Name</label>
                                <input
                                    type="text"
                                    value={formData.agencyName}
                                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">RERA ID</label>
                                <input
                                    type="text"
                                    value={formData.reraId}
                                    onChange={(e) => setFormData({ ...formData, reraId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                    setFormData({ name: '', email: '', phone: '', agencyName: '', reraId: '' });
                                }}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePartner}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                {showEditModal ? 'Save Changes' : 'Add Partner'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
