'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { RoleId } from '@/app/contexts/UnifiedAppContext';

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
    const [role, setRole] = useState<RoleId>('regional-manager');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const ASSIGNABLE_ROLES: RoleId[] = [
        'regional-manager',
        'marketing-manager',
        'marketing-lead',
        'ads-executive',
        'creative-executive',
        'commission-manager',
        'property-onboarding-manager',
        'property-partner',
        'channel-partner',
        'consultant'
    ];

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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Assign Manager to Regions</h2>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Assignment Orchestrator</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto flex-1">
                    {/* Role Selection */}
                    <div className="space-y-3">
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">1. Select Strategic Role</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {ASSIGNABLE_ROLES.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`px-3 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all h-12 flex items-center justify-center text-center ${role === r
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {r.replace(/-/g, ' ').replace('property ', '')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* User Search */}
                    <div className="space-y-4">
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">2. Identify Manager</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name or verified email..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {loading && (
                            <div className="flex items-center justify-center py-4">
                                <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                        )}

                        {users.length > 0 && (
                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-gray-50/30">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUserId(user.id)}
                                        className={`p-4 cursor-pointer transition-all border-b border-gray-100 last:border-b-0 group ${selectedUserId === user.id ? 'bg-blue-50/50' : 'hover:bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className={`text-sm font-bold transition-colors ${selectedUserId === user.id ? 'text-blue-600' : 'text-gray-900'}`}>{user.name}</p>
                                                <p className="text-[11px] font-medium text-gray-400 uppercase mt-0.5">{user.email}</p>
                                            </div>
                                            {selectedUserId === user.id && (
                                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-200">
                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {userSearch.length >= 2 && users.length === 0 && !loading && (
                            <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest py-2 italic">No compatible managers found</p>
                        )}
                    </div>

                    {/* Region Selection */}
                    <div className="space-y-4">
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">3. Scope Selection ({selectedRegionIds.length} Jurisdictions)</label>
                        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {regions.map((region) => (
                                <div
                                    key={region.id}
                                    onClick={() => handleRegionToggle(region.id)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer group flex items-start gap-3 ${selectedRegionIds.includes(region.id)
                                        ? 'bg-blue-50/50 border-blue-500/20 shadow-sm'
                                        : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                                        }`}
                                >
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 transition-all flex items-center justify-center ${selectedRegionIds.includes(region.id)
                                        ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200'
                                        : 'bg-gray-50 border-gray-200 group-hover:border-gray-300'
                                        }`}>
                                        {selectedRegionIds.includes(region.id) && (
                                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold transition-colors ${selectedRegionIds.includes(region.id) ? 'text-blue-600' : 'text-gray-900'}`}>{region.name}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-1">{region.code}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/30">
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !selectedUserId || selectedRegionIds.length === 0}
                        className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 transform active:scale-95"
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Finalizing...
                            </div>
                        ) : 'Confirm Allocation'}
                    </button>
                </div>
            </div>
        </div>
    );
}
