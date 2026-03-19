"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { consultantService } from '@/app/services/consultantService';

interface Unit {
    id: string;
    unitNumber: string;
    floor: number | null;
    type: string | null;
    area: number | null;
    price: number | string;
    status: string;
    projectName: string;
    tower?: {
        name: string;
    };
}

export default function ConsultantUnitsPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [units, setUnits] = useState<Unit[]>([]);

    const [projectsList, setProjectsList] = useState<string[]>(['All']);
    const [statusList, setStatusList] = useState<string[]>(['All']);

    const [selectedProject, setSelectedProject] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchData() {
            if (!token) return;
            try {
                const props = await consultantService.getAssignedProjects(token);

                const allUnits: Unit[] = [];
                const projectsSet = new Set<string>();
                const statusSet = new Set<string>();

                props.forEach((project: any) => {
                    if (project.name) {
                        projectsSet.add(project.name);
                    }
                    if (project.units && Array.isArray(project.units)) {
                        project.units.forEach((unit: any) => {
                            allUnits.push({
                                ...unit,
                                projectName: project.name || 'Unknown',
                            });
                            if (unit.status) statusSet.add(unit.status);
                        });
                    }
                });

                setUnits(allUnits);
                setProjectsList(['All', ...Array.from(projectsSet).sort()]);
                setStatusList(['All', ...Array.from(statusSet).sort()]);
            } catch (error) {
                console.error('Error fetching consultant units:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [token]);

    const filteredUnits = units.filter(unit => {
        const matchesProject = selectedProject === 'All' || unit.projectName === selectedProject;
        const matchesStatus = selectedStatus === 'All' || unit.status === selectedStatus;

        const q = searchQuery.toLowerCase();
        const matchesSearch =
            unit.unitNumber?.toLowerCase().includes(q) ||
            unit.projectName?.toLowerCase().includes(q) ||
            unit.type?.toLowerCase().includes(q);

        return matchesProject && matchesStatus && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'AVAILABLE': return 'bg-green-100 text-green-800';
            case 'SOLD': return 'bg-red-100 text-red-800';
            case 'RESERVED': return 'bg-yellow-100 text-yellow-800';
            case 'BOOKED': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Project Units</h1>
                    <p className="text-gray-600 mt-1">Track and manage individual units within your assigned projects</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search Units</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Search by unit number, project..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Project</label>
                            <select
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                            >
                                {projectsList.map(project => (
                                    <option key={project} value={project}>{project}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                            <select
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                {statusList.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Units Grid */}
                {filteredUnits.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUnits.map((unit) => (
                            <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Unit {unit.unitNumber || 'N/A'}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{unit.projectName}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded uppercase ${getStatusColor(unit.status)}`}>
                                            {unit.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Type</span>
                                            <span className="font-medium text-gray-900">{unit.type || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Tower</span>
                                            <span className="font-medium text-gray-900">{unit.tower?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Floor</span>
                                            <span className="font-medium text-gray-900">{unit.floor !== null ? unit.floor : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Area</span>
                                            <span className="font-medium text-gray-900">{unit.area ? `${unit.area} sq.ft.` : 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-xs text-gray-500 uppercase font-semibold">Price</span>
                                        <span className="text-lg font-bold text-blue-600">₹{Number(unit.price || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">No units found</h3>
                        <p className="mt-1 text-gray-500">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
