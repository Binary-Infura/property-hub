'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

interface MarkAsSoldModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
    initialUnitId?: string;
    units?: any[];
    onSold: () => void;
}

export default function MarkAsSoldModal({ isOpen, onClose, projectId, initialUnitId, units = [], onSold }: MarkAsSoldModalProps) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId || '');
    const [formData, setFormData] = useState({
        buyerName: '',
        buyerPhone: '',
        salePrice: '',
        soldAt: new Date().toISOString().split('T')[0],
    });

    useState(() => {
        if (initialUnitId && units.length > 0) {
            const unit = units.find(u => u.id === initialUnitId);
            if (unit) setFormData(prev => ({ ...prev, salePrice: unit.price?.toString() || '' }));
        }
    });

    if (!isOpen) return null;

    const availableUnits = units.filter(u => u.status !== 'SOLD');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'selectedUnitId') {
            setSelectedUnitId(value);
            const unit = units.find(u => u.id === value);
            if (unit) setFormData(prev => ({ ...prev, salePrice: unit.price?.toString() || '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedUnitId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/api/units/${selectedUnitId}/sold`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    buyerName: formData.buyerName,
                    buyerPhone: formData.buyerPhone,
                    salePrice: parseFloat(formData.salePrice),
                    soldAt: new Date(formData.soldAt).toISOString(),
                }),
            });

            if (res.ok) {
                onSold();
                onClose();
            } else {
                const err = await res.json();
                setError(err.message || 'Failed to mark as sold');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                />

                <div className="relative overflow-hidden rounded-2xl bg-white text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-md animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Mark as Sold</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Record the sale of a unit</p>
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

                        {availableUnits.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-gray-500 font-medium">No available units to sell.</p>
                                <p className="text-sm text-gray-400 mt-1">Add a new unit or check existing units.</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Unit *</label>
                                    <select
                                        name="selectedUnitId"
                                        required
                                        value={selectedUnitId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                    >
                                        <option value="">-- Choose a unit --</option>
                                        {availableUnits.map(unit => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.unitNumber} {unit.type ? `(${unit.type})` : ''} - ₹{unit.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-4 pt-1">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Buyer Name *</label>
                                        <input
                                            type="text"
                                            name="buyerName"
                                            required
                                            value={formData.buyerName}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Buyer Phone *</label>
                                        <input
                                            type="tel"
                                            name="buyerPhone"
                                            required
                                            value={formData.buyerPhone}
                                            onChange={handleInputChange}
                                            placeholder="+91 9876543210"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sale Price (₹) *</label>
                                            <input
                                                type="number"
                                                name="salePrice"
                                                required
                                                value={formData.salePrice}
                                                onChange={handleInputChange}
                                                placeholder="7500000"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sold Date *</label>
                                            <input
                                                type="date"
                                                name="soldAt"
                                                required
                                                value={formData.soldAt}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
                            >
                                {availableUnits.length === 0 ? 'Close' : 'Cancel'}
                            </button>
                            {availableUnits.length > 0 && (
                                <button
                                    type="submit"
                                    disabled={loading || !selectedUnitId}
                                    className="flex-[2] px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all text-sm flex items-center justify-center gap-2 disabled:bg-emerald-400"
                                >
                                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    Confirm Sale
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
