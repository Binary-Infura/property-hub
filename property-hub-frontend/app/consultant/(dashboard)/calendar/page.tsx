"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { consultantService } from '@/app/services/consultantService';
import ScheduleVisitModal from '@/app/components/consultant/ScheduleVisitModal';

type FilterType = 'today' | 'tomorrow' | 'thisWeek' | 'all';

export default function CalendarPage() {
    const { token } = useAuth();
    const [visits, setVisits] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<any>(null);
    const [selectedVisit, setSelectedVisit] = useState<any>(null);
    const [limit, setLimit] = useState(10);
    const [filter, setFilter] = useState<FilterType>('today');

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [visitsData, projectsData] = await Promise.all([
                consultantService.getVisits(token),
                consultantService.getAssignedProjects(token)
            ]);
            setVisits(visitsData);
            
            const allLeads = projectsData.flatMap((p: any) => 
                (p.leads || []).map((l: any) => ({
                    id: l.id,
                    name: l.name,
                    projectId: l.projectId,
                    projectName: p.name
                }))
            );
            setLeads(allLeads);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleUpdateStatus = async (visitId: string, status: string) => {
        if (!token) return;
        try {
            await consultantService.updateVisit(token, visitId, { status });
            await fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update visit status.');
        }
    };

    const handleDeleteVisit = async (visitId: string) => {
        if (!token || !confirm('Are you sure you want to delete this visit schedule?')) return;
        try {
            await consultantService.deleteVisit(token, visitId);
            await fetchData();
        } catch (error) {
            console.error('Error deleting visit:', error);
            alert('Failed to delete visit.');
        }
    };


    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'NO_SHOW': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const stats = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
        const endOfTomorrow = new Date(endOfToday);
        endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

        const endOfWeek = new Date(startOfToday);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999);

        const todayVisits = visits.filter(v => {
            const d = new Date(v.scheduledAt);
            return d >= startOfToday && d <= endOfToday;
        });

        const tomorrowVisits = visits.filter(v => {
            const d = new Date(v.scheduledAt);
            return d >= startOfTomorrow && d <= endOfTomorrow;
        });
        
        const thisWeekVisits = visits.filter(v => {
            const d = new Date(v.scheduledAt);
            return d >= startOfToday && d <= endOfWeek;
        });

        const completed = visits.filter(v => v.status === 'COMPLETED').length;
        const total = visits.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            today: todayVisits.length,
            tomorrow: tomorrowVisits.length,
            thisWeek: thisWeekVisits.length,
            completionRate: rate
        };
    }, [visits]);

    const filteredVisits = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
        const endOfTomorrow = new Date(endOfToday);
        endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

        const endOfWeek = new Date(startOfToday);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999);

        let result = [...visits];

        if (filter === 'today') {
            result = result.filter(v => {
                const d = new Date(v.scheduledAt);
                return d >= startOfToday && d <= endOfToday;
            });
        } else if (filter === 'tomorrow') {
            result = result.filter(v => {
                const d = new Date(v.scheduledAt);
                return d >= startOfTomorrow && d <= endOfTomorrow;
            });
        } else if (filter === 'thisWeek') {
            result = result.filter(v => {
                const d = new Date(v.scheduledAt);
                return d >= startOfToday && d <= endOfWeek;
            });
        }

        return result.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    }, [visits, filter]);

    const paginatedVisits = useMemo(() => {
        return filteredVisits.slice(0, limit);
    }, [filteredVisits, limit]);

    if (loading && visits.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Calendar & Visits</h1>
                        <p className="text-gray-600 mt-1">Manage your upcoming site visits and consultations</p>
                    </div>

                    <button 
                        onClick={() => {
                            setEditingVisit(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Schedule Visit
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Focus Dates</h2>
                                {filter !== 'all' && (
                                    <button 
                                        onClick={() => setFilter('all')}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        View All
                                    </button>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div 
                                    onClick={() => setFilter('today')}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${filter === 'today' ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900 shadow-sm'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold">Today</div>
                                        <div className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${filter === 'today' ? 'text-blue-200 border-blue-500/50 bg-blue-700/30' : 'text-gray-400 border-gray-200 bg-white'}`}>
                                            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className={`text-sm mt-1 ${filter === 'today' ? 'text-blue-100' : 'text-gray-600'}`}>You have {stats.today} visit{stats.today !== 1 ? 's' : ''} scheduled</div>
                                </div>
                                <div 
                                    onClick={() => setFilter('tomorrow')}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${filter === 'tomorrow' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900 shadow-sm'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold">Tomorrow</div>
                                        <div className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${filter === 'tomorrow' ? 'text-indigo-200 border-indigo-500/50 bg-indigo-700/30' : 'text-gray-400 border-gray-200 bg-white'}`}>
                                            {(() => {
                                                const d = new Date();
                                                d.setDate(d.getDate() + 1);
                                                return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                                            })()}
                                        </div>
                                    </div>
                                    <div className={`text-sm mt-1 ${filter === 'tomorrow' ? 'text-indigo-100' : 'text-gray-600'}`}>You have {stats.tomorrow} visit{stats.tomorrow !== 1 ? 's' : ''} scheduled</div>
                                </div>
                                <div 
                                    onClick={() => setFilter('thisWeek')}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${filter === 'thisWeek' ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900 shadow-sm'}`}
                                >
                                    <div className="font-bold">This Week</div>
                                    <div className={`text-sm mt-1 ${filter === 'thisWeek' ? 'text-purple-100' : 'text-gray-600'}`}>You have {stats.thisWeek} visit{stats.thisWeek !== 1 ? 's' : ''} scheduled</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 text-white text-center">
                            <h3 className="font-bold text-xl mb-2">Performance Tracking</h3>
                            <p className="text-blue-100 text-sm mb-4">Complete your pending site visits to boost your conversion rate.</p>
                            <div className="w-full bg-blue-900/50 rounded-full h-2 mb-2 overflow-hidden">
                                <div className="bg-white h-full transition-all duration-1000" style={{ width: `${stats.completionRate}%` }}></div>
                            </div>
                            <p className="text-xs text-blue-100">{stats.completionRate}% of scheduled visits completed</p>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 capitalize">
                                {filter === 'all' ? 'All Scheduled Visits' : `${filter}'s Visits`}
                                <span className="ml-2 text-sm font-normal text-gray-500">({filteredVisits.length})</span>
                            </h3>
                        </div>

                        {filteredVisits.length === 0 ? (
                            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No visits found</h3>
                                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                                    {filter === 'all' 
                                        ? "Start by scheduling your first site visit for a client using the button above."
                                        : `You don't have any visits scheduled for ${filter}.`}
                                </p>
                                {filter !== 'all' && (
                                    <button 
                                        onClick={() => setFilter('all')}
                                        className="mt-4 text-blue-600 font-semibold hover:underline"
                                    >
                                        View all visits
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {paginatedVisits.map((visit) => (
                                    <div 
                                        key={visit.id} 
                                        className={`bg-white p-5 rounded-xl shadow-sm border transition-all hover:shadow-md flex flex-col sm:flex-row gap-4 group ${selectedVisit?.id === visit.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100 hover:border-blue-200'}`}
                                    >
                                        <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start sm:w-36 sm:border-r border-gray-100 sm:pr-4">
                                            <div className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                                                {new Date(visit.scheduledAt).toLocaleDateString('en-US', { weekday: 'short' })}
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-gray-900">{new Date(visit.scheduledAt).getDate()}</span>
                                                <span className="text-sm font-semibold text-gray-500 uppercase">{new Date(visit.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}</span>
                                            </div>
                                            <div className="text-xs font-bold text-gray-400 mb-2">{new Date(visit.scheduledAt).getFullYear()}</div>
                                            <div className="text-xs font-semibold bg-gray-100 group-hover:bg-blue-50 group-hover:text-blue-700 text-gray-800 px-2.5 py-1 rounded-lg transition-colors">
                                                {new Date(visit.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        <div className="flex-grow flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">Site Visit - {visit.lead?.project?.name || 'Unknown Project'}</h3>
                                                    <div className="space-y-1 mt-1">
                                                        <div className="flex items-center text-gray-600 text-sm gap-2">
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            Client: {visit.lead?.name} ({visit.lead?.phone})
                                                        </div>
                                                        {visit.visitExecutive && (
                                                            <div className="flex items-center text-gray-600 text-sm gap-2">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                                </svg>
                                                                Exec: {visit.visitExecutive.firstName} {visit.visitExecutive.lastName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(visit.status)}`}>
                                                    {visit.status}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <button 
                                                    onClick={() => setSelectedVisit(selectedVisit?.id === visit.id ? null : visit)}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                >
                                                    {selectedVisit?.id === visit.id ? 'Hide Details' : 'View Details'}
                                                </button>
                                                
                                                {visit.status === 'SCHEDULED' && (
                                                    <>
                                                        <button 
                                                            onClick={() => {
                                                                setEditingVisit(visit);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                                        >
                                                            Reschedule
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(visit.id, 'COMPLETED')}
                                                            className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
                                                        >
                                                            Mark Completed
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(visit.id, 'CANCELLED')}
                                                            className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteVisit(visit.id)}
                                                    className="text-sm font-medium text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>

                                            {selectedVisit?.id === visit.id && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-500 font-medium">Notes</p>
                                                            <p className="text-gray-900 mt-1">{visit.notes || 'No specific notes provided.'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 font-medium">Project Location</p>
                                                            <p className="text-gray-900 mt-1">{visit.lead?.project?.location || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 font-medium">Lead ID</p>
                                                            <p className="text-gray-900 mt-1 font-mono text-xs">{visit.leadId}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 font-medium">Created On</p>
                                                            <p className="text-gray-900 mt-1">{new Date(visit.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {filteredVisits.length > limit && (
                            <div className="mt-6 text-center">
                                <button 
                                    onClick={() => setLimit(prev => prev + 10)}
                                    className="text-gray-500 font-medium hover:text-blue-600 transition-all bg-white px-6 py-3 rounded-lg border border-gray-200 shadow-sm hover:shadow hover:border-blue-200"
                                >
                                    Load More Visits
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ScheduleVisitModal 
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingVisit(null);
                }}
                token={token || ''}
                leads={leads}
                onSuccess={fetchData}
                editVisit={editingVisit}
            />
        </div>
    );
}
