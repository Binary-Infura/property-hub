'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import InviteUserModal from '@/app/components/invitations/InviteUserModal';

interface GlobalUser {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    role: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export default function GlobalUsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch data
    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/central-authority/users?page=${currentPage}&limit=${itemsPerPage}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const result = await res.json();
                setUsers(result.data);
                setTotalCount(result.total);
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, currentPage]);

    const handleAddUser = () => {
        setIsModalOpen(true);
    };

    const handleEditUser = (user: GlobalUser) => {
        // Edit implementation can be added later if API supports it
        alert("Edit functionality not fully implemented yet");
    };

    const handleToggleStatus = (id: string) => {
        // Status toggle implementation
        console.log("Toggle status for", id);
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
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Invite User
                    </button>
                </div>
            </div>



            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalCount}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium">Active (This Page)</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <th className="py-3 px-4">First Name</th>
                                    <th className="py-3 px-4">Last Name</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Phone</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                            No global users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => {
                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                                <td className="py-4 px-4 font-semibold text-gray-900">{user.firstName}</td>
                                                <td className="py-4 px-4 font-semibold text-gray-900">{user.lastName || '-'}</td>
                                                <td className="py-4 px-4 text-sm text-gray-700">{user.email}</td>
                                                <td className="py-4 px-4 text-gray-700">{user.phone || '-'}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {user.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex justify-end gap-3 text-sm">
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(user.id)}
                                                            className={`font-medium transition-colors ${user.status === 'active'
                                                                ? 'text-red-600 hover:text-red-800'
                                                                : 'text-green-600 hover:text-green-800'
                                                                }`}
                                                        >
                                                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {!loading && totalCount > 0 && (
                    <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-[12px] font-medium text-gray-400 tracking-wide">
                            Showing <span className="text-gray-900 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="text-gray-900 font-bold">{totalCount}</span> users
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

            {/* Invite User Modal */}
            <InviteUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                forcedRole="CENTRAL_AUTHORITY"
            />
        </div>
    );
}
