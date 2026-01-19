'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock project data - replace with actual API calls
interface Project {
    id: string;
    name: string;
    location: string;
    type: 'residential' | 'commercial' | 'mixed';
    status: 'active' | 'upcoming' | 'completed' | 'on-hold';
    totalBuildings: number;
    totalUnits: number;
    bookedUnits: number;
    startDate: Date;
    completionDate: Date;
    thumbnail?: string;
    createdAt: Date;
}

const MOCK_PROJECTS: Project[] = [
    {
        id: 'prop_1767858213328',
        name: 'Sunset Towers',
        location: 'Bandra, Mumbai',
        type: 'residential',
        status: 'active',
        totalBuildings: 3,
        totalUnits: 240,
        bookedUnits: 156,
        startDate: new Date('2023-01-15'),
        completionDate: new Date('2025-12-31'),
        createdAt: new Date('2023-01-01'),
    },
    {
        id: 'prop_1767858213329',
        name: 'City Square',
        location: 'Andheri, Mumbai',
        type: 'commercial',
        status: 'upcoming',
        totalBuildings: 2,
        totalUnits: 120,
        bookedUnits: 45,
        startDate: new Date('2024-06-01'),
        completionDate: new Date('2026-12-31'),
        createdAt: new Date('2024-01-15'),
    },
    {
        id: 'prop_1767858213330',
        name: 'Green Valley Residency',
        location: 'Powai, Mumbai',
        type: 'residential',
        status: 'active',
        totalBuildings: 5,
        totalUnits: 400,
        bookedUnits: 280,
        startDate: new Date('2022-03-01'),
        completionDate: new Date('2025-06-30'),
        createdAt: new Date('2022-01-10'),
    },
    {
        id: 'prop_1767858213331',
        name: 'Metro Business Hub',
        location: 'BKC, Mumbai',
        type: 'mixed',
        status: 'completed',
        totalBuildings: 1,
        totalUnits: 80,
        bookedUnits: 80,
        startDate: new Date('2021-01-01'),
        completionDate: new Date('2023-12-31'),
        createdAt: new Date('2020-11-01'),
    },
];

const STATUS_CONFIG = {
    active: { label: 'Active', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-500' },
    upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-800', dotColor: 'bg-blue-500' },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', dotColor: 'bg-gray-500' },
    'on-hold': { label: 'On Hold', color: 'bg-amber-100 text-amber-800', dotColor: 'bg-amber-500' },
};

const TYPE_CONFIG = {
    residential: { label: 'Residential', color: 'text-blue-600' },
    commercial: { label: 'Commercial', color: 'text-purple-600' },
    mixed: { label: 'Mixed Use', color: 'text-indigo-600' },
};

export default function ProjectsPage() {
    const [projects] = useState<Project[]>(MOCK_PROJECTS);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProjects = projects.filter(project => {
        const matchesStatus = !selectedStatus || project.status === selectedStatus;
        const matchesSearch = !searchQuery ||
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getBookingPercentage = (booked: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((booked / total) * 100);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Link href="/builder/dashboard" className="hover:text-gray-900">
                                    Dashboard
                                </Link>
                                <span>→</span>
                                <span className="text-gray-900 font-medium">All Projects</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                            <p className="text-gray-600 mt-1">Manage all your real estate projects</p>
                        </div>
                        <Link
                            href="/builder/dashboard/properties/add"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Project
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Total Projects</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{projects.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Active</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {projects.filter(p => p.status === 'active').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Total Units</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                            {projects.reduce((sum, p) => sum + p.totalUnits, 0)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-600 text-sm font-medium">Avg. Booking</p>
                        <p className="text-3xl font-bold text-orange-600 mt-2">
                            {projects.length > 0
                                ? Math.round(
                                    (projects.reduce((sum, p) => sum + p.bookedUnits, 0) /
                                        projects.reduce((sum, p) => sum + p.totalUnits, 0)) *
                                    100
                                )
                                : 0}
                            %
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            <button
                                onClick={() => setSelectedStatus(null)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition ${selectedStatus === null
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                            >
                                All
                            </button>
                            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${selectedStatus === status
                                            ? config.color
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                {filteredProjects.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => {
                            const statusConfig = STATUS_CONFIG[project.status];
                            const typeConfig = TYPE_CONFIG[project.type];
                            const bookingPercentage = getBookingPercentage(project.bookedUnits, project.totalUnits);

                            return (
                                <Link
                                    key={project.id}
                                    href={`/builder/dashboard/projects/${project.id}`}
                                    className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-300 transition-all overflow-hidden group"
                                >
                                    {/* Thumbnail / Header */}
                                    <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-700 relative">
                                        <div className="absolute inset-0 bg-black/10"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-xl font-bold text-white truncate">{project.name}</h3>
                                            <p className="text-blue-100 text-sm truncate">{project.location}</p>
                                        </div>
                                        <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-4">
                                        {/* Type and Buildings */}
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-medium ${typeConfig.color}`}>
                                                {typeConfig.label}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {project.totalBuildings} Building{project.totalBuildings > 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                                    Total Units
                                                </p>
                                                <p className="text-2xl font-bold text-gray-900">{project.totalUnits}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                                                    Booked
                                                </p>
                                                <p className="text-2xl font-bold text-green-600">{project.bookedUnits}</p>
                                            </div>
                                        </div>

                                        {/* Booking Progress */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Booking Progress</span>
                                                <span className="text-sm font-bold text-gray-900">{bookingPercentage}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${bookingPercentage >= 80
                                                            ? 'bg-green-500'
                                                            : bookingPercentage >= 50
                                                                ? 'bg-blue-500'
                                                                : 'bg-amber-500'
                                                        }`}
                                                    style={{ width: `${bookingPercentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Completion Date */}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Completion</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(project.completionDate).toLocaleDateString('en-IN', {
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            Created {new Date(project.createdAt).toLocaleDateString('en-IN')}
                                        </span>
                                        <span className="text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                            View Details →
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 text-center py-12">
                        <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 21l-4.35-4.35m0 0A7.5 7.5 0 103.305 3.305a7.5 7.5 0 0010.345 10.345z"
                            />
                        </svg>
                        <p className="text-gray-600 font-medium mb-1">No projects found</p>
                        <p className="text-gray-500 text-sm mb-4">Try adjusting your search or filters</p>
                        <Link
                            href="/builder/dashboard/properties/add"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Your First Project
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
