'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { PROPERTY_STATUS_CONFIG } from '@/app/constants/property';
import { Property } from '@/app/services/propertyService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CentralAuthorityPropertiesPage() {
    const { token } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchProperties = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${API_URL}/api/projects`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProperties(data);
                }
            } catch (error) {
                console.error('Failed to fetch properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [token]);

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.city?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || property.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const config = PROPERTY_STATUS_CONFIG[status.toLowerCase() as keyof typeof PROPERTY_STATUS_CONFIG] || {
            label: status,
            color: 'text-gray-700',
            bgColor: 'bg-gray-100'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.color}`}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Total Properties</h1>
                    <p className="text-gray-600 mt-2">Oversee and manage all property listings across the platform.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium font-bold">Properties</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                        <span className="text-sm text-gray-500">Total Count:</span>
                        <span className="ml-2 font-bold text-gray-900">{properties.length}</span>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, location, or city..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white font-medium"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="SUBMITTED">Pending Approval</option>
                        <option value="APPROVED">Approved</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="SOLD">Sold</option>
                    </select>
                </div>
            </div>

            {/* Properties Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Property</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Location</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Price</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Agents</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Partner</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProperties.map((property) => (
                                <tr key={property.id} className="hover:bg-blue-50/20 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{property.name}</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{property.projectType}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-700">{property.location}</span>
                                            <span className="text-xs text-gray-400">{property.city?.name}, {property.city?.state}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-black text-slate-900">
                                            ₹{new Intl.NumberFormat('en-IN').format(property.price)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        {getStatusBadge(property.status)}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {property.assignedTo && property.assignedTo.length > 0 ? (
                                                <>
                                                    {property.assignedTo.slice(0, 3).map((consultant, i) => (
                                                        <div
                                                            key={consultant.id}
                                                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm"
                                                            title={`${consultant.firstName} ${consultant.lastName || ''}`}
                                                        >
                                                            {consultant.firstName[0]}{consultant.lastName?.[0] || ''}
                                                        </div>
                                                    ))}
                                                    {property.assignedTo.length > 3 && (
                                                        <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-gray-600 text-[10px] font-black shadow-sm">
                                                            +{property.assignedTo.length - 3}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300 italic uppercase tracking-wider">Not Assigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-700">
                                                {property.onboardedBy ? `${property.onboardedBy.firstName || ''} ${property.onboardedBy.lastName || ''}` : 'System'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]">{property.onboardedBy?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Link
                                            href={`/dashboard/properties/${property.id}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-95"
                                        >
                                            Manage
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredProperties.length === 0 && (
                    <div className="p-16 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 mb-6 group-hover:scale-110 transition-transform">
                            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No properties found</h3>
                        <p className="text-gray-500 font-medium mt-2">Try adjusting your search filters or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
