'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import AddCommissionManagerModal from '@/app/components/central-authority/AddCommissionManagerModal';

interface CommissionManager {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export default function CommissionManagersPage() {
    const { token } = useAuth();
    const [managers, setManagers] = useState<any[]>([]);
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
            const res = await fetch(`/api/commission-managers?page=${currentPage}&limit=${itemsPerPage}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const result = await res.json();
                setManagers(result.data);
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


    const handleAddManager = () => {
        setIsModalOpen(true);
    };

    const handleEditManager = (manager: CommissionManager) => {
        alert("Edit functionality not fully implemented yet");
    };

    const handleToggleStatus = (id: string) => {
        console.log("Toggle status for", id);
    };

    const activeCount = managers.filter(m => m.status === 'active').length;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Commission Managers</h1>
                        <p className="text-gray-600 mt-1">Manage commission managers and their cities</p>
                    </div>
                    <button
                        onClick={handleAddManager}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Manager
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Managers</p>
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
                                ) : managers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                            No commission managers found.
                                        </td>
                                    </tr>
                                ) : (
                                    managers.map((manager) => {
                                        return (
                                            <tr key={manager.id} className="hover:bg-gray-50 transition">
                                                <td className="py-4 px-4 font-semibold text-gray-900">{manager.firstName}</td>
                                                <td className="py-4 px-4 font-semibold text-gray-900">{manager.lastName || '-'}</td>
                                                <td className="py-4 px-4 text-sm text-gray-700">{manager.email}</td>
                                                <td className="py-4 px-4 text-gray-700">{manager.phone || '-'}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${manager.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {manager.status === 'active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex justify-end gap-3 text-sm">
                                                        <button
                                                            onClick={() => handleEditManager(manager)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(manager.id)}
                                                            className={`font-medium transition-colors ${manager.status === 'active'
                                                                ? 'text-red-600 hover:text-red-800'
                                                                : 'text-green-600 hover:text-green-800'
                                                                }`}
                                                        >
                                                            {manager.status === 'active' ? 'Deactivate' : 'Activate'}
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
                            Showing <span className="text-gray-900 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="text-gray-900 font-bold">{totalCount}</span> managers
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

            {/* Add Commission Manager Modal */}
            <AddCommissionManagerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
