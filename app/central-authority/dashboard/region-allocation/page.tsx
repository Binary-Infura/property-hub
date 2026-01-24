'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import AssignRoleModal from '@/app/components/central-authority/AssignRoleModal';
import EditAssignmentModal from '@/app/components/central-authority/EditAssignmentModal';
import RemoveAssignmentDialog from '@/app/components/central-authority/RemoveAssignmentDialog';

interface AssignedUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
}

interface RegionAllocation {
    id: string;
    name: string;
    code: string;
    active: boolean;
    assignedUsers: AssignedUser[];
}

type ManagerRole = 'regional-manager' | 'marketing-manager' | 'commission-manager' | '';

export default function RegionAllocationPage() {
    const { token } = useAuth();
    const [allocations, setAllocations] = useState<RegionAllocation[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [roleFilter, setRoleFilter] = useState<ManagerRole>('');
    const [regionFilter, setRegionFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [regions, setRegions] = useState<{ id: string; name: string; code: string }[]>([]);

    // Modals
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AssignedUser | null>(null);
    const [selectedRegionId, setSelectedRegionId] = useState<string>('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Fetch allocations
    const fetchAllocations = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (roleFilter) params.append('role', roleFilter);
            if (regionFilter) params.append('regionId', regionFilter);
            if (searchQuery) params.append('search', searchQuery);

            const response = await fetch(`${API_URL}/api/region-allocations?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setAllocations(data);
            }
        } catch (err) {
            console.error('Failed to fetch allocations:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all regions for filter dropdown
    const fetchRegions = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/regions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setRegions(data);
            }
        } catch (err) {
            console.error('Failed to fetch regions:', err);
        }
    };

    useEffect(() => {
        fetchRegions();
    }, [token]);

    useEffect(() => {
        fetchAllocations();
    }, [token, roleFilter, regionFilter, searchQuery]);

    const handleRemove = (user: AssignedUser, regionId: string) => {
        setSelectedUser(user);
        setSelectedRegionId(regionId);
        setShowRemoveDialog(true);
    };

    const handleEdit = (user: AssignedUser) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const confirmRemove = async () => {
        if (!selectedUser || !selectedRegionId || !token) return;
        try {
            const response = await fetch(
                `${API_URL}/api/region-allocations/${selectedUser.id}/regions/${selectedRegionId}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.ok) {
                setShowRemoveDialog(false);
                fetchAllocations();
            } else {
                alert('Failed to remove assignment');
            }
        } catch (err) {
            console.error('Failed to remove assignment:', err);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'regional-manager':
                return 'bg-blue-100 text-blue-700';
            case 'marketing-manager':
                return 'bg-purple-100 text-purple-700';
            case 'commission-manager':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleName = (role: string) => {
        switch (role) {
            case 'regional-manager':
                return 'Regional Manager';
            case 'marketing-manager':
                return 'Marketing Manager';
            case 'commission-manager':
                return 'Commission Manager';
            default:
                return role;
        }
    };

    // Pagination
    const totalPages = Math.ceil(allocations.length / itemsPerPage);
    const paginatedAllocations = allocations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Region Allocation</h1>
                    <p className="text-gray-600 mt-2">
                        Manage region assignments for managers across different roles
                    </p>
                </div>
                <button
                    onClick={() => setShowAssignModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2 font-semibold"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Assign Role
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as ManagerRole)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Roles</option>
                            <option value="regional-manager">Regional Manager</option>
                            <option value="marketing-manager">Marketing Manager</option>
                            <option value="commission-manager">Commission Manager</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Region</label>
                        <select
                            value={regionFilter}
                            onChange={(e) => setRegionFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Regions</option>
                            {regions.map((region) => (
                                <option key={region.id} value={region.id}>
                                    {region.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-500">Loading allocations...</p>
                    </div>
                ) : paginatedAllocations.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No region allocations found.</p>
                        <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or assign new roles.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Region</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Code</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Assigned Users</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedAllocations.map((region) => (
                                    <tr key={region.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">{region.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {region.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {region.assignedUsers.length === 0 ? (
                                                <span className="text-sm text-gray-400 italic">No users assigned</span>
                                            ) : (
                                                <div className="space-y-2">
                                                    {region.assignedUsers.map((user) => (
                                                        <div key={user.id} className="flex items-center gap-3">
                                                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                                {getRoleName(user.role)}
                                                            </span>
                                                            <div className="flex gap-2 ml-auto">
                                                                <button
                                                                    onClick={() => handleEdit(user)}
                                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemove(user, region.id)}
                                                                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm text-gray-600">
                                                {region.assignedUsers.length} {region.assignedUsers.length === 1 ? 'user' : 'users'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, allocations.length)} of {allocations.length} regions
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AssignRoleModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onSuccess={fetchAllocations}
            />
            <EditAssignmentModal
                isOpen={showEditModal}
                user={selectedUser}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                onSuccess={fetchAllocations}
            />
            <RemoveAssignmentDialog
                isOpen={showRemoveDialog}
                user={selectedUser}
                onClose={() => {
                    setShowRemoveDialog(false);
                    setSelectedUser(null);
                    setSelectedRegionId('');
                }}
                onConfirm={confirmRemove}
            />
        </div>
    );
}
