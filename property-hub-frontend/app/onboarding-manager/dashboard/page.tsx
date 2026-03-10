'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { userService, User } from '@/app/services/userService';

export default function BrokerPartnersPage() {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();
    const [brokers, setBrokers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        agencyName: '',
        reraId: '',
    });

    const fetchBrokers = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const result = await userService.getAllByRole(
                'BROKER',
                token
            );
            setBrokers(result.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch Broker partners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrokers();
    }, [token]);

    const handleAddBroker = () => {
        setFormData({ firstName: '', lastName: '', email: '', phone: '', agencyName: '', reraId: '' });
        setShowAddModal(true);
    };

    const handleEditBroker = (broker: User) => {
        setFormData({
            firstName: broker.firstName,
            lastName: broker.lastName || '',
            email: broker.email,
            phone: broker.phone || '',
            agencyName: broker.agencyName || '',
            reraId: broker.reraId || '',
        });
        setSelectedBroker(broker);
        setShowEditModal(true);
    };

    const handleSaveBroker = async () => {
        if (!token) return;
        try {
            if (selectedBroker) {
                const updated = await userService.update(selectedBroker.id, formData, token);
                setBrokers(brokers.map(d => d.id === selectedBroker.id ? updated : d));
                setShowEditModal(false);
            } else {
                const created = await userService.create({
                    ...formData,
                    role: 'BROKER',
                }, token);
                setBrokers([created, ...brokers]);
                setShowAddModal(false);
            }
            setFormData({ firstName: '', lastName: '', email: '', phone: '', agencyName: '', reraId: '' });
            setSelectedBroker(null);
        } catch (err: any) {
            alert(err.message || 'Failed to save Broker partner');
        }
    };

    const handleToggleStatus = async (id: string) => {
        if (!token) return;
        try {
            const updated = await userService.toggleStatus(id, token);
            setBrokers(brokers.map(d => d.id === id ? updated : d));
        } catch (err: any) {
            alert(err.message || 'Failed to toggle status');
        }
    };

    const activeCount = brokers.filter(d => d.status === 'active').length;

    if (loading && brokers.length === 0) {
        return <div className="p-8 text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading Broker Partners...</p>
        </div>;
    }

    return (
        <div className="p-8">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Broker Partners</h1>
                    <p className="text-gray-600 mt-1">Manage Real Estate Brokers and their performance</p>
                </div>
                <button
                    onClick={handleAddBroker}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition flex items-center gap-2 shadow-lg shadow-blue-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Invite New Broker
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Partners</p>
                    <h3 className="text-3xl font-bold text-gray-900">{brokers.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Brokers</p>
                    <h3 className="text-3xl font-bold text-green-600">{activeCount}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending Approvals</p>
                    <h3 className="text-3xl font-bold text-blue-600">0</h3>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
                    </svg>
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr className="text-left">
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-wider">Broker Details</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-wider">Agency / RERA</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {brokers.map((broker) => (
                                <tr key={broker.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-gray-900">{broker.firstName} {broker.lastName}</div>
                                        <div className="text-gray-500">{broker.email}</div>
                                        <div className="text-xs text-gray-400 mt-1">{broker.phone}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-semibold text-gray-700">{broker.agencyName || 'Personal'}</div>
                                        <div className="text-xs text-blue-600 font-medium uppercase tracking-tighter">{broker.reraId || 'No RERA ID'}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${broker.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {broker.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEditBroker(broker)}
                                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                title="Edit Broker"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(broker.id)}
                                                className={`p-2 rounded-lg transition-colors ${broker.status === 'active' ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'
                                                    }`}
                                                title={broker.status === 'active' ? 'Deactivate' : 'Activate'}
                                            >
                                                {broker.status === 'active' ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {brokers.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-gray-500">
                                        No Broker partners found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                    {showEditModal ? 'Update Broker Partner' : 'Invite Broker Partner'}
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Strategic Partnership Setup</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                    setFormData({ firstName: '', lastName: '', email: '', phone: '', agencyName: '', reraId: '' });
                                }}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold placeholder:font-medium"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold placeholder:font-medium"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold placeholder:font-medium"
                                    disabled={showEditModal}
                                    placeholder="name@agency.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold placeholder:font-medium"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Agency / Business Name</label>
                                <input
                                    type="text"
                                    value={formData.agencyName}
                                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold placeholder:font-medium"
                                    placeholder="e.g. Royal Estates"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">RERA ID (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.reraId}
                                    onChange={(e) => setFormData({ ...formData, reraId: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold placeholder:font-medium"
                                    placeholder="RERA-XX-XXXX-XXXX"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setShowEditModal(false);
                                        setFormData({ firstName: '', lastName: '', email: '', phone: '', agencyName: '', reraId: '' });
                                    }}
                                    className="flex-1 px-6 py-4 border border-gray-100 font-bold text-gray-400 rounded-2xl hover:bg-gray-50 transition-all text-sm uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveBroker}
                                    className="flex-1 px-6 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 text-sm uppercase tracking-widest"
                                >
                                    {showEditModal ? 'Save Changes' : 'Send Invitation'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
