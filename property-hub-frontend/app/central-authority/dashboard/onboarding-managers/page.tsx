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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedManager, setSelectedManager] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });

    const fetchManagers = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const result = await userService.getAllByRole(
                'ONBOARDING_MANAGER',
                token,
                false,
                currentPage,
                itemsPerPage
            );
            setManagers(result.data);
            setTotalCount(result.total);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch managers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManagers();
    }, [token, currentPage]);

    const handleAddManager = () => {
        setFormData({ firstName: '', lastName: '', email: '', phone: '' });
        setShowAddModal(true);
    };

    const handleEditManager = (manager: User) => {
        setFormData({
            firstName: manager.firstName,
            lastName: manager.lastName || '',
            email: manager.email,
            phone: manager.phone || '',
        });
        setSelectedManager(manager);
        setShowEditModal(true);
    };

    const handleSaveManager = async () => {
        if (!token) return;
        try {
            const dataToSave = {
                ...formData,
            };

            if (selectedManager) {
                const updated = await userService.update(selectedManager.id, dataToSave, token);
                setManagers(managers.map(m => m.id === selectedManager.id ? updated : m));
                setShowEditModal(false);
            } else {
                const created = await userService.create({
                    ...dataToSave,
                    role: 'ONBOARDING_MANAGER',
                }, token);
                setManagers([created, ...managers]);
                setShowAddModal(false);
            }
            setFormData({ firstName: '', lastName: '', email: '', phone: '' });
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
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-4 font-medium animate-pulse uppercase tracking-widest text-[10px]">Syncing Personnel Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Onboarding Managers</h1>
                    <p className="text-gray-500 mt-2 text-sm max-w-lg leading-relaxed">
                        Manage your elite property onboarding workforce. Add, update, or recalibrate access for managers responsible for metropolitan growth.
                    </p>
                </div>
                <button
                    onClick={handleAddManager}
                    className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-200 transition-all transform active:scale-95 flex items-center gap-2 font-bold text-sm"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Onboarding Manager
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Manager Identity</th>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Last Name</th>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Communication</th>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Communication</th>
                            <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Status</th>
                            <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {managers.length > 0 ? (
                            managers.map((manager) => (
                                <tr key={manager.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold text-xs ring-4 ring-orange-50/50 group-hover:scale-110 transition-transform duration-300 uppercase">
                                                {(manager.firstName || 'M').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{manager.firstName || 'Unknown'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Joined {manager.createdAt ? new Date(manager.createdAt).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-700">
                                        {manager.lastName || '-'}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-bold text-gray-900">{manager.email}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{manager.phone || 'NO DIRECT PHONE'}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2 py-1 text-[9px] font-black rounded-md uppercase tracking-wider ${manager.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {manager.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button
                                                onClick={() => handleEditManager(manager)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Edit Profile"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(manager.id)}
                                                className={`p-2 rounded-xl transition-all ${manager.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                                title={manager.status === 'active' ? 'Deactivate' : 'Activate'}
                                            >
                                                {manager.status === 'active' ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-900">No Onboarding Managers Found</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            You haven't onboarded any managers yet.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {!loading && totalCount > 0 && (
                    <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-[12px] font-medium text-gray-400 tracking-wide">
                            Showing <span className="text-gray-900 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="text-gray-900 font-bold">{totalCount}</span> experts
                        </div>
                        {totalPages > 1 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                    {showEditModal ? 'Scale Profile' : 'Onboard New Expert'}
                                </h2>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Identity Configuration</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                    setFormData({ firstName: '', lastName: '', email: '', phone: '' });
                                }}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium"
                                        placeholder="Alpha"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium"
                                        placeholder="Manager"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Corporate Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium disabled:opacity-50"
                                    disabled={showEditModal}
                                    placeholder="expert@propertyhub.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Primary Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setShowEditModal(false);
                                        setFormData({ firstName: '', lastName: '', email: '', phone: '' });
                                    }}
                                    className="flex-1 px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleSaveManager}
                                    className="flex-[1.5] px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-bold text-sm transition-all shadow-lg shadow-orange-200 transform active:scale-95"
                                >
                                    {showEditModal ? 'Commit Changes' : 'Execute Onboarding'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
