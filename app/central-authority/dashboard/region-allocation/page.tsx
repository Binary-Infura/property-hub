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

            const response = await fetch(`${API_URL}/api/regions/allocations/all?${params}`, {
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
                `${API_URL}/api/regions/allocations/${selectedUser.id}/regions/${selectedRegionId}`,
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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Region Allocation</h1>
                    <p className="text-gray-500 mt-2 text-sm max-w-lg leading-relaxed">
                        Strategically manage region assignments for managers. Efficiently oversee regional, marketing, and commission-based allocations.
                    </p>
                </div>
                <button
                    onClick={() => setShowAssignModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all transform active:scale-95 flex items-center gap-2 font-bold text-sm"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Assign New Manager
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Filter by Role</label>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as ManagerRole)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                    >
                        <option value="">All Managerial Roles</option>
                        <option value="regional-manager">Regional Manager</option>
                        <option value="marketing-manager">Marketing Manager</option>
                        <option value="commission-manager">Commission Manager</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Filter by Region</label>
                    <select
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                    >
                        <option value="">All Operating Regions</option>
                        {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                                {region.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex-[1.5] min-w-[300px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Search Assignments</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Find by name or email address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-gray-400 mt-4 font-medium text-sm animate-pulse">Syncing allocations...</p>
                    </div>
                ) : paginatedAllocations.length === 0 ? (
                    <div className="text-center py-32">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Allocations Found</h3>
                        <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">We couldn't find any assignments matching your current criteria.</p>
                        <button
                            onClick={() => { setRoleFilter(''); setRegionFilter(''); setSearchQuery(''); }}
                            className="mt-6 text-blue-600 hover:text-blue-700 font-bold text-sm"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Region Details</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Current Assignments</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Capacity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedAllocations.map((region) => (
                                    <tr key={region.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs ring-4 ring-blue-50/50">
                                                    {region.code}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight">{region.name}</p>
                                                    <p className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">{region.active ? 'Operational' : 'Inactive'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {region.assignedUsers.length === 0 ? (
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                    </svg>
                                                    <span className="text-sm font-medium italic">Pending assignments</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    {region.assignedUsers.map((user) => (
                                                        <div key={user.id} className="flex items-center gap-4 bg-white p-2.5 pr-4 rounded-xl border border-gray-100 shadow-sm group/user hover:border-blue-200 hover:shadow-md hover:shadow-blue-50/50 transition-all duration-300">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200 shadow-inner group-hover/user:from-blue-50 group-hover/user:to-blue-100 group-hover/user:text-blue-600 group-hover/user:border-blue-200 transition-all">
                                                                {user.name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                                                <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block mt-0.5 uppercase tracking-tighter ${getRoleColor(user.role)}`}>
                                                                    {getRoleName(user.role)}
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-1 ml-auto opacity-0 group-hover/user:opacity-100 transition-all transform translate-x-2 group-hover/user:translate-x-0">
                                                                <button
                                                                    onClick={() => handleEdit(user)}
                                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                                                                    title="Edit assignment"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemove(user, region.id)}
                                                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Revoke access"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="inline-flex flex-col items-end gap-1">
                                                <span className="text-xl font-black text-gray-900 leading-none">
                                                    {region.assignedUsers.length}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {region.assignedUsers.length === 1 ? 'Liaison' : 'Liaisons'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-[12px] font-medium text-gray-400 tracking-wide">
                            Showing <span className="text-gray-900 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, allocations.length)}</span> of <span className="text-gray-900 font-bold">{allocations.length}</span> regions
                        </div>
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
