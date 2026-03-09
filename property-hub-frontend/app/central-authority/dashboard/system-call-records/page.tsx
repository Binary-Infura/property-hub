'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { callLogService } from '@/app/services/callLogService';
import { userService, User } from '@/app/services/userService';
import { propertyService, Project } from '@/app/services/propertyService';

export default function SystemCallRecordsPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);

    // Filters
    const [consultants, setConsultants] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedConsultant, setSelectedConsultant] = useState('');
    const [selectedProject, setSelectedProject] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!token) return;
            try {
                // Fetch consultants and projects for filters
                const consultantsData = await userService.getAllByRole('consultant', token, false, 1, 100);
                setConsultants(consultantsData.data);

                const projectsData = await propertyService.getAll(token);
                setProjects(projectsData);
            } catch (error) {
                console.error('Failed to fetch filter data:', error);
            }
        };
        fetchInitialData();
    }, [token]);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!token) return;
            setLoading(true);
            try {
                const data = await callLogService.getCallLogs(token, {
                    consultantId: selectedConsultant || undefined,
                    projectId: selectedProject || undefined
                });
                setLogs(data);
            } catch (error) {
                console.error('Failed to fetch call logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [token, selectedConsultant, selectedProject]);

    const formatDuration = (seconds?: number | null) => {
        if (!seconds) return '--';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Call Records</h1>
                    <p className="text-gray-600 mt-2">Comprehensive history of all communication via the platform.</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div className="w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by User (Consultant)</label>
                    <select
                        value={selectedConsultant}
                        onChange={(e) => setSelectedConsultant(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                    >
                        <option value="">All Consultants</option>
                        {consultants.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.firstName} {c.lastName} ({c.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Property (Project)</label>
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                    >
                        <option value="">All Projects</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => { setSelectedConsultant(''); setSelectedProject(''); }}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium h-[42px]"
                >
                    Clear Filters
                </button>
            </div>

            {/* Records Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">From (Consultant)</th>
                                    <th className="px-6 py-4">To (Lead)</th>
                                    <th className="px-6 py-4">Property</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4 text-right">Recording</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.map((log) => (
                                    <tr key={log.id} className="text-sm hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {log.consultant?.firstName} {log.consultant?.lastName}
                                            </div>
                                            <div className="text-xs text-gray-400">{log.consultant?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{log.lead?.name}</div>
                                            <div className="text-xs text-gray-400">{log.lead?.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-700">{log.lead?.project?.name || '--'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${log.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {log.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {formatDuration(log.duration)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {log.recordingUrl ? (
                                                <a
                                                    href={log.recordingUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Listen
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 italic">No recording</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                                            No call records found matching the filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
