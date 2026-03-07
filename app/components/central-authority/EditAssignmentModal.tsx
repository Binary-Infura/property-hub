'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface EditAssignmentModalProps {
    isOpen: boolean;
    user: { id: string; firstName: string; lastName?: string; email: string; role: string } | null;
    onClose: () => void;
    onSuccess: () => void;
    isCityContext?: boolean;
}

interface City {
    id: string;
    name: string;
    code: string;
    city?: string;
}

export default function EditAssignmentModal({ isOpen, user, onClose, onSuccess, isCityContext }: EditAssignmentModalProps) {
    const { token } = useAuth();
    const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
    const [allCities, setAllCities] = useState<City[]>([]);
    const [userCities, setUserCities] = useState<City[]>([]);
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
            // Fetch all cities
            const citiesResponse = await fetch(`${API_URL}/api/cities?limit=1000`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (citiesResponse.ok) {
                const citiesData = await citiesResponse.json();
                setAllCities(citiesData.data);
            }

            // Fetch user's current cities (we'll get them from allocations)
            const allocationsResponse = await fetch(`${API_URL}/api/cities/allocations/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (allocationsResponse.ok) {
                const allocationsData = await allocationsResponse.json();
                const userCitiesList: City[] = [];
                allocationsData.forEach((city: any) => {
                    const hasUser = city.assignedUsers.some((u: any) => u.id === user.id);
                    if (hasUser) {
                        userCitiesList.push({ id: city.id, name: city.name, code: city.code });
                    }
                });
                setUserCities(userCitiesList);
                setSelectedCityIds(userCitiesList.map(c => c.id));
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCityToggle = (cityId: string) => {
        setSelectedCityIds((prev) =>
            prev.includes(cityId)
                ? prev.filter((id) => id !== cityId)
                : [...prev, cityId]
        );
    };

    const handleSubmit = async () => {
        if (!user || !token) return;

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/cities/allocations/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cityIds: selectedCityIds,
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Edit City Assignment</h2>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Scope Calibration</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-gray-400 mt-4 font-bold text-[11px] uppercase tracking-widest">Retrieving assignments...</p>
                        </div>
                    ) : (
                        <>
                            {/* User Info */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-100 flex items-center gap-5 shadow-inner">
                                <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-lg font-black text-blue-600">
                                    {user.firstName[0]}{user.lastName ? user.lastName[0] : ''}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Authenticated Manager</p>
                                    <p className="font-bold text-gray-900 truncate leading-tight">{user.firstName} {user.lastName}</p>
                                    <p className="text-sm font-medium text-gray-500 mt-0.5">{user.email}</p>
                                    <div className="mt-3 flex gap-2">
                                        <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-black text-white rounded-md uppercase tracking-wider">
                                            {user.role.replace('-', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Region Selection */}
                            <div className="space-y-4">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
                                    {isCityContext ? 'City Scope' : 'Jurisdiction Scope'} ({selectedCityIds.length} active)
                                </label>
                                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                    {allCities.map((city) => (
                                        <div
                                            key={city.id}
                                            onClick={() => handleCityToggle(city.id)}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer group flex items-start gap-3 ${selectedCityIds.includes(city.id)
                                                ? 'bg-blue-50/50 border-blue-500/20 shadow-sm'
                                                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                                                }`}
                                        >
                                            <div className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 transition-all flex items-center justify-center ${selectedCityIds.includes(city.id)
                                                ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200'
                                                : 'bg-gray-50 border-gray-200 group-hover:border-gray-300'
                                                }`}>
                                                {selectedCityIds.includes(city.id) && (
                                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-sm font-bold transition-colors ${selectedCityIds.includes(city.id) ? 'text-blue-600' : 'text-gray-900'}`}>{isCityContext ? (city.city || city.name) : city.name}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-1">{city.code}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/30">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || loading || selectedCityIds.length === 0}
                        className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 transform active:scale-95"
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Syncing...
                            </div>
                        ) : 'Save Scope Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
