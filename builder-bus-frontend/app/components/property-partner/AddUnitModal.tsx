'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { PropertyCategory, Tower } from '@/app/types/property';
import { RESIDENTIAL_UNIT_TYPES, PLOT_UNIT_TYPES } from '@/app/constants/property';
import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

interface AddUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectCategory?: PropertyCategory;
    onAdded: () => void;
}

export default function AddUnitModal({ isOpen, onClose, projectId, projectCategory, onAdded }: AddUnitModalProps) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        unitNumber: '',
        floor: '',
        type: projectCategory === 'plot' ? PLOT_UNIT_TYPES[0] : '2BHK',
        area: '',
        price: '',
        towerId: '',
    });
    const [towers, setTowers] = useState<Tower[]>([]);

    useEffect(() => {
        if (isOpen && projectId) {
            fetch(`${API_URL}/api/towers/project/${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setTowers(data))
            .catch(err => console.error('Error fetching towers:', err));
        }
    }, [isOpen, projectId, token]);

    if (!isOpen) return null;

    const unitLabel = projectCategory === 'plot' ? 'Plot' : 'Unit';
    const typeOptions = projectCategory === 'plot' ? PLOT_UNIT_TYPES : RESIDENTIAL_UNIT_TYPES;
    const selectedTower = towers.find(t => t.id === formData.towerId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/units`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    projectId,
                    unitNumber: formData.unitNumber,
                    floor: formData.floor ? parseInt(formData.floor) : undefined,
                    type: formData.type || undefined,
                    area: formData.area ? parseFloat(formData.area) : undefined,
                    price: parseFloat(formData.price),
                    towerId: formData.towerId || undefined,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to add unit');
            }

            onAdded();
            onClose();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center text-gray-900 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold">Add New {unitLabel}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Enter details for the new {unitLabel.toLowerCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Tower / Building *</label>
                            <select
                                required
                                value={formData.towerId}
                                onChange={(e) => setFormData({ ...formData, towerId: e.target.value, floor: '' })}
                                className="w-full border-2 border-blue-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium transition-all"
                            >
                                <option value="">-- Choose a Tower --</option>
                                {towers.map(tower => (
                                    <option key={tower.id} value={tower.id}>{tower.name} ({tower.totalFloors} Floors)</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{unitLabel} Number / ID *</label>
                        <input
                            required
                            type="text"
                            value={formData.unitNumber}
                            onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. A-101"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {projectCategory !== 'plot' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Floor *</label>
                                <select
                                    disabled={!formData.towerId}
                                    required
                                    value={formData.floor}
                                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium disabled:bg-gray-50 disabled:text-gray-400"
                                >
                                    <option value="">-- {formData.towerId ? 'Select Floor' : 'Select Tower First'} --</option>
                                    {selectedTower?.totalFloors && (
                                        Array.from({ length: selectedTower.totalFloors }, (_, i) => i + 1).map(f => (
                                            <option key={f} value={f}>Floor {f}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        )}
                        <div className={projectCategory === 'plot' ? 'col-span-2' : ''}>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                            >
                                <option value="" disabled>Select {unitLabel} Type</option>
                                {typeOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Area (Sq Ft)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="1000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) *</label>
                            <input
                                required
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="5000000"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.towerId}
                            className="flex-[2] px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:bg-blue-400"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {loading ? 'Adding...' : `Add ${unitLabel}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
