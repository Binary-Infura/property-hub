'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { bankService, Bank } from '@/app/services/bankService';

export default function BankManagerSection() {
    const { token } = useAuth();
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingBank, setEditingBank] = useState<Bank | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        percentage: 8.5,
        isActive: true
    });

    const fetchBanks = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const data = await bankService.getAllBanks(token);
            setBanks(data);
        } catch (error) {
            console.error('Failed to fetch banks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, [token]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            if (editingBank) {
                await bankService.updateBank(token, editingBank.id, formData);
            } else {
                await bankService.createBank(token, formData);
            }
            setIsAdding(false);
            setEditingBank(null);
            setFormData({ name: '', percentage: 8.5, isActive: true });
            fetchBanks();
        } catch (error) {
            console.error('Error saving bank:', error);
            alert('Failed to save bank');
        }
    };

    const handleDelete = async (id: string) => {
        if (!token || !confirm('Are you sure you want to delete this bank?')) return;
        try {
            await bankService.deleteBank(token, id);
            fetchBanks();
        } catch (error) {
            alert('Failed to delete bank');
        }
    };

    const handleToggleActive = async (bank: Bank) => {
        if (!token) return;
        try {
            await bankService.updateBank(token, bank.id, { isActive: !bank.isActive });
            fetchBanks();
        } catch (error) {
            alert('Failed to update bank status');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Bank & Loan Configuration</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage banks and their default interest rates for loan calculations.</p>
                </div>
                <button
                    onClick={() => {
                        setIsAdding(!isAdding);
                        setEditingBank(null);
                        setFormData({ name: '', percentage: 8.5, isActive: true });
                    }}
                    className={`text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isAdding
                        ? 'bg-orange-50 text-orange-600 border border-orange-100'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    <svg className={`w-4 h-4 transition-transform ${isAdding ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {isAdding ? 'Cancel' : 'Add New Bank'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSave} className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{editingBank ? 'Edit Bank' : 'Add New Bank'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Bank Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter bank name..."
                                required
                                className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Interest Rate (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.percentage}
                                onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                                required
                                className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-end gap-3">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                {editingBank ? 'Update Bank' : 'Save Bank'}
                            </button>
                            {editingBank && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingBank(null);
                                        setIsAdding(false);
                                    }}
                                    className="bg-gray-100 text-gray-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto min-h-[200px]">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-4 py-3">Bank Name</th>
                                <th className="px-4 py-3 text-center">Percentage (%)</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {banks.map((bank) => (
                                <tr key={bank.id} className="text-sm group hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 font-bold text-gray-900 uppercase">
                                        {bank.name}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg">
                                            {bank.percentage}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button
                                            onClick={() => handleToggleActive(bank)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${bank.isActive
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {bank.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingBank(bank);
                                                    setIsAdding(true);
                                                    setFormData({
                                                        name: bank.name,
                                                        percentage: Number(bank.percentage),
                                                        isActive: bank.isActive
                                                    });
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bank.id)}
                                                className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {banks.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                                        No banks configured yet. Add your first bank above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
