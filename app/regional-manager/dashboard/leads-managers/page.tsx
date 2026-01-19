'use client';

import { useState } from 'react';

interface LeadsManager {
    id: string;
    name: string;
    email: string;
    phone: string;
    assignedTeam: string;
    dailyCapacity: number;
    status: 'active' | 'inactive';
    createdAt: string;
}

export default function LeadsManagersPage() {
    const [managers, setManagers] = useState<LeadsManager[]>([
        {
            id: '1',
            name: 'Vikram Malhotra',
            email: 'vikram.m@propertyhub.com',
            phone: '+91 98765 11223',
            assignedTeam: 'North Mumbai Team',
            dailyCapacity: 50,
            status: 'active',
            createdAt: '2024-01-15',
        },
        {
            id: '2',
            name: 'Neha Gupta',
            email: 'neha.g@propertyhub.com',
            phone: '+91 98765 33445',
            assignedTeam: 'South Mumbai Team',
            dailyCapacity: 40,
            status: 'active',
            createdAt: '2024-02-10',
        },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedManager, setSelectedManager] = useState<LeadsManager | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        assignedTeam: '',
        dailyCapacity: '',
    });

    const handleAddManager = () => {
        setFormData({ name: '', email: '', phone: '', assignedTeam: '', dailyCapacity: '' });
        setShowAddModal(true);
    };

    const handleEditManager = (manager: LeadsManager) => {
        setFormData({
            name: manager.name,
            email: manager.email,
            phone: manager.phone,
            assignedTeam: manager.assignedTeam,
            dailyCapacity: manager.dailyCapacity.toString(),
        });
        setSelectedManager(manager);
        setShowEditModal(true);
    };

    const handleSaveManager = () => {
        if (selectedManager) {
            // Edit existing
            setManagers(managers.map(m =>
                m.id === selectedManager.id
                    ? { ...m, ...formData, dailyCapacity: parseInt(formData.dailyCapacity) || 0 }
                    : m
            ));
            setShowEditModal(false);
        } else {
            // Add new
            const newManager: LeadsManager = {
                id: Date.now().toString(),
                ...formData,
                dailyCapacity: parseInt(formData.dailyCapacity) || 0,
                status: 'active',
                createdAt: new Date().toISOString().split('T')[0],
            };
            setManagers([...managers, newManager]);
            setShowAddModal(false);
        }
        setFormData({ name: '', email: '', phone: '', assignedTeam: '', dailyCapacity: '' });
        setSelectedManager(null);
    };

    const handleToggleStatus = (id: string) => {
        setManagers(managers.map(m =>
            m.id === id
                ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' }
                : m
        ));
    };

    const activeCount = managers.filter(m => m.status === 'active').length;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Leads Managers</h1>
                        <p className="text-gray-600 mt-1">Manage leads managers and their capacities</p>
                    </div>
                    <button
                        onClick={handleAddManager}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Manager
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Managers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{managers.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Active</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Daily Capacity</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                        {managers.reduce((sum, m) => sum + m.dailyCapacity, 0)}
                    </p>
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
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Team</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Daily Capacity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {managers.map((manager) => (
                                    <tr key={manager.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{manager.name}</p>
                                                <p className="text-sm text-gray-500">{manager.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-gray-700">{manager.assignedTeam}</td>
                                        <td className="py-4 px-4 text-gray-700">{manager.phone}</td>
                                        <td className="py-4 px-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                {manager.dailyCapacity} leads
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${manager.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {manager.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditManager(manager)}
                                                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(manager.id)}
                                                    className={`px-3 py-1 rounded text-sm font-medium ${manager.status === 'active'
                                                            ? 'text-red-600 hover:bg-red-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {manager.status === 'active' ? 'Deactivate' : 'Activate'}
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

            {/* Modal (Shared for Add/Edit) */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {showEditModal ? 'Edit Leads Manager' : 'Add New Leads Manager'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Team</label>
                                <input
                                    type="text"
                                    value={formData.assignedTeam}
                                    onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Lead Capacity</label>
                                <input
                                    type="number"
                                    value={formData.dailyCapacity}
                                    onChange={(e) => setFormData({ ...formData, dailyCapacity: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                    setFormData({ name: '', email: '', phone: '', assignedTeam: '', dailyCapacity: '' });
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
