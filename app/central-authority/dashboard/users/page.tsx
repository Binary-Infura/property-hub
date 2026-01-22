'use client';

import { useState } from 'react';

interface GlobalUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export default function GlobalUsersPage() {
    const [users, setUsers] = useState<GlobalUser[]>([
        {
            id: '1',
            name: 'Vikram Singh',
            email: 'vikram.s@propertyhub.com',
            phone: '+91 98765 11223',
            role: 'Super Admin',
            status: 'active',
            createdAt: '2024-01-15',
        },
        {
            id: '2',
            name: 'Sarah Jenkins',
            email: 'sarah.j@propertyhub.com',
            phone: '+91 98765 99887',
            role: 'Compliance Officer',
            status: 'active',
            createdAt: '2024-02-20',
        },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<GlobalUser | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
    });

    const handleAddUser = () => {
        setFormData({ name: '', email: '', phone: '', role: '' });
        setShowAddModal(true);
    };

    const handleEditUser = (user: GlobalUser) => {
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        });
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleSaveUser = () => {
        if (selectedUser) {
            // Edit existing
            setUsers(users.map(u =>
                u.id === selectedUser.id
                    ? { ...u, ...formData }
                    : u
            ));
            setShowEditModal(false);
        } else {
            // Add new
            const newUser: GlobalUser = {
                id: Date.now().toString(),
                ...formData,
                status: 'active',
                createdAt: new Date().toISOString().split('T')[0],
            };
            setUsers([...users, newUser]);
            setShowAddModal(false);
        }
        setFormData({ name: '', email: '', phone: '', role: '' });
        setSelectedUser(null);
    };

    const handleToggleStatus = (id: string) => {
        setUsers(users.map(u =>
            u.id === id
                ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
                : u
        ));
    };

    const activeCount = users.filter(u => u.status === 'active').length;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Global Users</h1>
                        <p className="text-gray-600 mt-1">Manage global users and their roles</p>
                    </div>
                    <button
                        onClick={handleAddUser}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Global User
                    </button>
                </div>
            </div>

            {/* Mock Data Warning */}
            <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg flex items-start gap-4 shadow-sm">
                <div className="text-amber-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-amber-800">Development Mode: Mock Data</h3>
                    <p className="text-amber-700 text-sm mt-1">
                        The users listed below are temporary mock data for UI testing. This page is not yet connected to the Keycloak Admin database.
                        <strong> New users created in Keycloak will not appear here automatically.</strong>
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
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
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-gray-700">{user.role}</td>
                                        <td className="py-4 px-4 text-gray-700">{user.phone}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {user.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user.id)}
                                                    className={`px-3 py-1 rounded text-sm font-medium ${user.status === 'active'
                                                        ? 'text-red-600 hover:bg-red-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
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
                            {showEditModal ? 'Edit Global User' : 'Add Global User'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                    setFormData({ name: '', email: '', phone: '', role: '' });
                                }}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveUser}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                {showEditModal ? 'Save Changes' : 'Add User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
