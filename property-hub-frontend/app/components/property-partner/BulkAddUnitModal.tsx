'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { PropertyCategory, Tower } from '@/app/types/property';
import { RESIDENTIAL_UNIT_TYPES, PLOT_UNIT_TYPES } from '@/app/constants/property';
import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface BulkAddUnitModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectCategory?: PropertyCategory;
    onAdded: () => void;
}

export default function BulkAddUnitModal({ isOpen, onClose, projectId, projectCategory, onAdded }: BulkAddUnitModalProps) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        prefix: '',
        startNumber: 1,
        endNumber: 10,
        floor: '', // Becomes a string from the select, then parsed
        type: projectCategory === 'plot' ? PLOT_UNIT_TYPES[0] : '2BHK',
        area: '',
        price: '',
        towerId: '',
        allFloors: false,
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

        if (formData.startNumber > formData.endNumber) {
            setError('Start number cannot be greater than end number');
            return;
        }

        if (!formData.towerId) {
            setError('Please select a tower');
            return;
        }

        const towersToProcess = [selectedTower]; // Could potentially support multiple towers if needed, but keeping it simple
        const floorsToProcess = formData.allFloors && selectedTower 
            ? Array.from({ length: selectedTower.totalFloors || 0 }, (_, i) => i + 1)
            : [parseInt(formData.floor)];

        if (!formData.allFloors && isNaN(parseInt(formData.floor))) {
            setError('Please select a floor');
            return;
        }

        const unitsPerFloor = formData.endNumber - formData.startNumber + 1;
        const totalUnits = unitsPerFloor * floorsToProcess.length;

        if (totalUnits > 500) {
            setError(`You are trying to create ${totalUnits} units. Please limit to 500 at a time.`);
            return;
        }

        setLoading(true);
        setError(null);

        const units = [];
        for (const floorNum of floorsToProcess) {
            for (let i = formData.startNumber; i <= formData.endNumber; i++) {
                units.push({
                    unitNumber: `${formData.prefix}${i}`,
                    floor: floorNum,
                    type: formData.type || undefined,
                    area: formData.area ? parseFloat(formData.area) : undefined,
                    price: parseFloat(formData.price),
                    towerId: formData.towerId,
                });
            }
        }

        try {
            const res = await fetch(`${API_URL}/api/units/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    projectId,
                    units,
                }),
            });

            if (res.ok) {
                onAdded();
                onClose();
            } else {
                const err = await res.json();
                setError(err.message || 'Failed to add units in bulk');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center text-gray-900 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold">Bulk Add {unitLabel}s</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Generate multiple {unitLabel.toLowerCase()}s automatically</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100 italic">
                            {error}
                        </div>
                    )}

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

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Prefix</label>
                            <input
                                type="text"
                                value={formData.prefix}
                                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. A-"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Start # *</label>
                            <input
                                required
                                type="number"
                                value={formData.startNumber}
                                onChange={(e) => setFormData({ ...formData, startNumber: parseInt(e.target.value) })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">End # *</label>
                            <input
                                required
                                type="number"
                                value={formData.endNumber}
                                onChange={(e) => setFormData({ ...formData, endNumber: parseInt(e.target.value) })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        {projectCategory !== 'plot' && (
                            <div className="space-y-2">
                                <label className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold text-gray-700">Floor *</span>
                                    <label className="flex items-center gap-1.5 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                        <input
                                            type="checkbox"
                                            className="w-3 h-3 rounded text-blue-600 focus:ring-blue-500"
                                            checked={formData.allFloors}
                                            onChange={(e) => setFormData({ ...formData, allFloors: e.target.checked })}
                                        />
                                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tighter">All Floors</span>
                                    </label>
                                </label>
                                <select
                                    disabled={formData.allFloors || !formData.towerId}
                                    required={!formData.allFloors}
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
                                placeholder="1200"
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
                            Create {((formData.endNumber - formData.startNumber + 1) * (formData.allFloors && selectedTower ? selectedTower.totalFloors || 0 : 1))} {unitLabel}s
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
