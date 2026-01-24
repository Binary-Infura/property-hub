'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface AssignRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface Region {
    id: string;
    name: string;
    code: string;
}

export default function AssignRoleModal({ isOpen, onClose, onSuccess }: AssignRoleModalProps) {
    const { token } = useAuth();
    const [role, setRole] = useState<'regional-manager' | 'marketing-manager' | 'commission-manager'>('regional-manager');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (isOpen) {
            fetchRegions();
        }
    }, [isOpen]);

    useEffect(() => {
        if (role && userSearch.length >= 2) {
            searchUsers();
        } else {
            setUsers([]);
        }
    }, [role, userSearch]);

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

    const searchUsers = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/api/region-allocations/users/search?query=${userSearch}&role=${role}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (err) {
            console.error('Failed to search users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegionToggle = (regionId: string) => {
        setSelectedRegionIds((prev) =>
            prev.includes(regionId)
                ? prev.filter((id) => id !== regionId)
                : [...prev, regionId]
        );
    };

    const handleSubmit = async () => {
        if (!selectedUserId || selectedRegionIds.length === 0 || !token) {
            alert('Please select a user and at least one region');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/region-allocations/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: selectedUserId,
                    regionIds: selectedRegionIds,
                }),
            });

            if (response.ok) {
                resetForm();
                onSuccess();
                onClose();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to assign regions');
            }
        } catch (err) {
            console.error('Failed to assign regions:', err);
            alert('An error occurred while assigning regions');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setRole('regional-manager');
        setSelectedUserId('');
        setSelectedRegionIds([]);
        setUserSearch('');
        setUsers([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Assign Role to Regions</h2>
                    <p className="text-gray-600 mt-1 text-sm">Select a user and assign them to one or more regions</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as any)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="regional-manager">Regional Manager</option>
                            <option value="marketing-manager">Marketing Manager</option>
                            <option value="commission-manager">Commission Manager</option>
                        </select>
                    </div>

                    {/* User Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search User</label>
                        <input
                            type="text"
                            placeholder="Type to search users by name or email..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {loading && (
                            <p className="text-sm text-gray-500 mt-2">Searching...</p>
                        )}
                        {users.length > 0 && (
                            <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUserId(user.id)}
                                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${selectedUserId === user.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Region Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Regions ({selectedRegionIds.length} selected)
                        </label>
                        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                            {regions.map((region) => (
                                <label
                                    key={region.id}
                                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedRegionIds.includes(region.id)}
                                        onChange={() => handleRegionToggle(region.id)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-900">{region.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">{region.code}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !selectedUserId || selectedRegionIds.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Assigning...' : 'Assign Regions'}
                    </button>
                </div>
            </div>
        </div>
    );
}
