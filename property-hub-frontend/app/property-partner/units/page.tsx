'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import MarkAsSoldModal from '@/app/components/property-partner/MarkAsSoldModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Unit {
    id: string;
    unitNumber: string;
    floor: string;
    type: string;
    area: number;
    price: number;
    status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'DRAFT';
    projectId: string;
    project: {
        name: string;
        location: string;
        category?: string;
    };
    tower?: {
        name: string;
    };
    buyerName?: string;
    buyerPhone?: string;
    salePrice?: number;
    soldAt?: string;
}

export default function UnitsPage() {
    const { token } = useAuth();
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
    const [isMarkAsSoldModalOpen, setIsMarkAsSoldModalOpen] = useState(false);
    const [activeUnitForSale, setActiveUnitForSale] = useState<Unit | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUnits, setTotalUnits] = useState(0);
    const UNITS_PER_PAGE = 12;


    const fetchUnits = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/units/my?page=${currentPage}&limit=${UNITS_PER_PAGE}&search=${searchQuery}&status=${statusFilter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUnits(data.units);
                setTotalUnits(data.total);
            }

        } catch (e) {
            console.error('Failed to fetch units:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUnits();
        }, 300);
        return () => clearTimeout(timer);
    }, [token, currentPage, searchQuery, statusFilter]);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);


    const toggleSelectAll = () => {
        if (selectedUnitIds.length === units.length) {
            setSelectedUnitIds([]);
        } else {
            setSelectedUnitIds(units.map(u => u.id));
        }
    };

    const toggleSelectUnit = (id: string) => {
        setSelectedUnitIds(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!selectedUnitIds.length) return;
        if (!confirm(`Are you sure you want to delete ${selectedUnitIds.length} units?`)) return;

        try {
            const res = await fetch(`${API_URL}/api/units/bulk`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ids: selectedUnitIds })
            });

            if (res.ok) {
                fetchUnits();
                setSelectedUnitIds([]);
            } else {
                alert('Failed to delete units');
            }
        } catch (e) {
            console.error('Error in bulk delete:', e);
        }
    };

    const openMarkAsSold = (unit: Unit) => {
        setActiveUnitForSale(unit);
        setIsMarkAsSoldModalOpen(true);
    };

    const handleSingleDelete = async (id: string, unitNumber: string) => {
        if (!confirm(`Are you sure you want to delete unit ${unitNumber}?`)) return;
        try {
            const res = await fetch(`${API_URL}/api/units/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                fetchUnits();
            } else {
                alert('Failed to delete unit');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">All Units</h1>
                        <p className="text-gray-600 mt-1">Manage and track all individual units across your projects</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {selectedUnitIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 text-sm font-bold border border-red-200"
                        >
                            Delete {selectedUnitIds.length} Selected
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[300px]">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by unit #, project, or buyer..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="SOLD">Sold</option>
                    <option value="RESERVED">Reserved</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading units...</p>
                </div>
            ) : units.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-gray-500 text-lg font-medium">No units found matching your criteria</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedUnitIds.length > 0 && selectedUnitIds.length === units.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Unit Detail</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Tower</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Project</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Information</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {units.map((unit) => (
                                    <tr key={unit.id} className={`hover:bg-gray-50/5 transition-colors ${selectedUnitIds.includes(unit.id) ? 'bg-blue-50/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={selectedUnitIds.includes(unit.id)}
                                                onChange={() => toggleSelectUnit(unit.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">
                                                {unit.project.category === 'PLOT' ? 'Plot' :
                                                    unit.project.category === 'VILLA' ? 'Villa' :
                                                        'Unit'} #{unit.unitNumber}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {unit.type} {['PLOT', 'VILLA'].includes(unit.project.category || '') ? '' : `• Floor ${unit.floor}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{unit.tower?.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-400">Tower</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{unit.project.name}</div>
                                            <div className="text-xs text-blue-600 font-medium">{unit.project.category || 'PROJECT'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${unit.status === 'SOLD' ? 'bg-emerald-100 text-emerald-700' :
                                                unit.status === 'RESERVED' ? 'bg-amber-100 text-amber-700' :
                                                    unit.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {unit.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {unit.status === 'SOLD' ? (
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{unit.buyerName}</div>
                                                    <div className="text-[10px] text-emerald-600 font-bold uppercase">₹{unit.salePrice?.toLocaleString()}</div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">₹{unit.price.toLocaleString()}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase">{unit.area} Sq Ft</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 space-x-4">
                                            <Link
                                                href={`/dashboard/projects/${unit.projectId}`}
                                                className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase tracking-wider"
                                            >
                                                View
                                            </Link>
                                            {unit.status !== 'SOLD' && (
                                                <button
                                                    onClick={() => openMarkAsSold(unit)}
                                                    className="text-emerald-600 hover:text-emerald-700 text-xs font-bold uppercase tracking-wider"
                                                >
                                                    Mark Sold
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleSingleDelete(unit.id, unit.unitNumber)}
                                                className="text-red-600 hover:text-red-700 text-xs font-bold uppercase tracking-wider"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalUnits > UNITS_PER_PAGE && (
                        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-500 font-medium">
                                Showing <span className="text-gray-900">{(currentPage - 1) * UNITS_PER_PAGE + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * UNITS_PER_PAGE, totalUnits)}</span> of <span className="text-gray-900">{totalUnits}</span> units
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all font-bold"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={currentPage * UNITS_PER_PAGE >= totalUnits}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all font-bold"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            )}

            <MarkAsSoldModal
                isOpen={isMarkAsSoldModalOpen}
                onClose={() => setIsMarkAsSoldModalOpen(false)}
                initialUnitId={activeUnitForSale?.id}
                units={activeUnitForSale ? [activeUnitForSale] : []}
                onSold={fetchUnits}
            />
        </div>
    );
}
