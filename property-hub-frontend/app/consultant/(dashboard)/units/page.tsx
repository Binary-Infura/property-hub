'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { consultantService } from '@/app/services/consultantService';
import MarkAsSoldModal from '@/app/components/property-partner/MarkAsSoldModal';

interface Unit {
    id: string;
    unitNumber: string;
    floor: number | null;
    type: string | null;
    area: number | null;
    price: number | string;
    status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'BOOKED' | string;
    projectId: string;
    project: {
        name: string;
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

export default function ConsultantUnitsPage() {
    const { token } = useAuth();
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [isMarkAsSoldModalOpen, setIsMarkAsSoldModalOpen] = useState(false);
    const [activeUnitForSale, setActiveUnitForSale] = useState<Unit | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const UNITS_PER_PAGE = 12;

    const fetchUnits = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const projects = await consultantService.getAssignedProjects(token);

            const allUnits: Unit[] = [];
            projects.forEach((project: any) => {
                if (project.units && Array.isArray(project.units)) {
                    project.units.forEach((unit: any) => {
                        allUnits.push({
                            ...unit,
                            projectId: project.id,
                            project: {
                                name: project.name || 'Unknown',
                                category: project.category,
                            },
                        });
                    });
                }
            });

            setUnits(allUnits);
        } catch (error) {
            console.error('Error fetching consultant units:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, [token]);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const filteredUnits = units.filter(unit => {
        const matchesStatus =
            statusFilter === 'all' || unit.status === statusFilter;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            unit.unitNumber?.toLowerCase().includes(q) ||
            unit.project?.name?.toLowerCase().includes(q) ||
            unit.type?.toLowerCase().includes(q) ||
            unit.buyerName?.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    const totalUnits = filteredUnits.length;
    const paginatedUnits = filteredUnits.slice(
        (currentPage - 1) * UNITS_PER_PAGE,
        currentPage * UNITS_PER_PAGE
    );

    const openMarkAsSold = (unit: Unit) => {
        setActiveUnitForSale(unit);
        setIsMarkAsSoldModalOpen(true);
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
                        <p className="text-gray-600 mt-1">Track and manage units across your assigned projects</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
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
                    <option value="RESERVED">Reserved</option>
                    <option value="BOOKED">Booked</option>
                    <option value="SOLD">Sold</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading units...</p>
                </div>
            ) : paginatedUnits.length === 0 ? (
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
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Unit Detail</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Tower</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Project</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Information</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-[10px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedUnits.map((unit) => (
                                    <tr key={unit.id} className="hover:bg-gray-50/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">
                                                {unit.project.category === 'PLOT' ? 'Plot' :
                                                    unit.project.category === 'VILLA' ? 'Villa' :
                                                        'Unit'} #{unit.unitNumber}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {unit.type} {['PLOT', 'VILLA'].includes(unit.project.category || '') ? '' : unit.floor !== null ? `• Floor ${unit.floor}` : ''}
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
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                unit.status === 'SOLD' ? 'bg-emerald-100 text-emerald-700' :
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
                                                    <div className="text-sm font-bold text-gray-900">₹{Number(unit.price || 0).toLocaleString()}</div>
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalUnits > UNITS_PER_PAGE && (
                        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-100">
                            <p className="text-sm text-gray-500 font-medium">
                                Showing <span className="text-gray-900">{(currentPage - 1) * UNITS_PER_PAGE + 1}</span> to{' '}
                                <span className="text-gray-900">{Math.min(currentPage * UNITS_PER_PAGE, totalUnits)}</span> of{' '}
                                <span className="text-gray-900">{totalUnits}</span> units
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={currentPage * UNITS_PER_PAGE >= totalUnits}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
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
