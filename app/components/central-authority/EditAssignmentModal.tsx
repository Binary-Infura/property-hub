'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface EditAssignmentModalProps {
    isOpen: boolean;
    user: { id: string; name: string; email: string; role: string } | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface Region {
    id: string;
    name: string;
    code: string;
}

export default function EditAssignmentModal({ isOpen, user, onClose, onSuccess }: EditAssignmentModalProps) {
    const { token } = useAuth();
    const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
    const [allRegions, setAllRegions] = useState<Region[]>([]);
    const [userRegions, setUserRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (isOpen && user) {
            fetchData();
        }
    }, [isOpen, user]);

    const fetchData = async () => {
        if (!token || !user) return;
        setLoading(true);
        try {
            // Fetch all regions
            const regionsResponse = await fetch(`${API_URL}/api/regions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (regionsResponse.ok) {
                const regionsData = await regionsResponse.json();
                setAllRegions(regionsData);
            }

            // Fetch user's current regions (we'll get them from allocations)
            const allocationsResponse = await fetch(`${API_URL}/api/region-allocations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (allocationsResponse.ok) {
                const allocationsData = await allocationsResponse.json();
                const userRegionsList: Region[] = [];
                allocationsData.forEach((region: any) => {
                    const hasUser = region.assignedUsers.some((u: any) => u.id === user.id);
                    if (hasUser) {
                        userRegionsList.push({ id: region.id, name: region.name, code: region.code });
                    }
                });
                setUserRegions(userRegionsList);
                setSelectedRegionIds(userRegionsList.map(r => r.id));
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
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
        if (!user || !token) return;

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/region-allocations/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    regionIds: selectedRegionIds,
                }),
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to update assignments');
            }
        } catch (err) {
            console.error('Failed to update assignments:', err);
            alert('An error occurred while updating assignments');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Region Assignment</h2>
                    <p className="text-gray-600 mt-1 text-sm">
                        Update region assignments for {user.name}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    ) : (
                        <>
                            {/* User Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-700">User Details</p>
                                <p className="font-semibold text-gray-900 mt-1">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <p className="text-xs text-gray-500 mt-1 capitalize">{user.role.replace('-', ' ')}</p>
                            </div>

                            {/* Region Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assigned Regions ({selectedRegionIds.length} selected)
                                </label>
                                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                                    {allRegions.map((region) => (
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
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || loading || selectedRegionIds.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
