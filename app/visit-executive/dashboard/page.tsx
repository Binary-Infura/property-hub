'use client';

import { useState } from 'react';

// Types
interface Visit {
    id: string;
    clientName: string;
    clientPhone: string;
    propertyTitle: string;
    location: string;
    scheduledTime: string; // ISO string
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'no-show';
    notes?: string;
    feedback?: {
        rating: number;
        comment: string;
    };
}

export default function VisitExecutiveDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'schedule'>('overview');

    // Mock Data
    const upcomingVisits: Visit[] = [
        {
            id: 'v1',
            clientName: 'Rahul Sharma',
            clientPhone: '+91 9876543210',
            propertyTitle: 'Sunset Heights, 3BHK',
            location: 'Andheri West, Mumbai',
            scheduledTime: new Date(new Date().setHours(14, 0)).toISOString(), // Today 2 PM
            status: 'scheduled',
        },
        {
            id: 'v2',
            clientName: 'Sneha Gupta',
            clientPhone: '+91 9876543211',
            propertyTitle: 'Green Valley, Villa 4',
            location: 'Powai, Mumbai',
            scheduledTime: new Date(new Date().setHours(16, 30)).toISOString(), // Today 4:30 PM
            status: 'scheduled',
        },
        {
            id: 'v3',
            clientName: 'Amit Verma',
            clientPhone: '+91 9876543212',
            propertyTitle: 'Ocean View, 2BHK',
            location: 'Worli, Mumbai',
            scheduledTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
            status: 'scheduled',
        },
    ];

    const recentCompletedVisits: Visit[] = [
        {
            id: 'v4',
            clientName: 'Priya Singh',
            clientPhone: '+91 9876543213',
            propertyTitle: 'Skyline Towers, 4BHK',
            location: 'Bandra, Mumbai',
            scheduledTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
            status: 'completed',
            feedback: {
                rating: 5,
                comment: 'Very professional, detailed explanation of the property.'
            }
        }
    ];

    const stats = {
        todayVisits: upcomingVisits.filter(v => new Date(v.scheduledTime).toDateString() === new Date().toDateString()).length,
        completedThisWeek: 12,
        avgRating: 4.8,
        totalClients: 45
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back, Executive</h1>
                <p className="text-gray-600 mt-2">Here is your schedule and performance overview for today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Visits Today</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-3xl font-bold text-blue-600">{stats.todayVisits}</p>
                        <span className="text-sm text-gray-500">scheduled</span>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Completed (Week)</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedThisWeek}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Avg Rating</p>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-3xl font-bold text-yellow-600">{stats.avgRating}</p>
                        <span className="text-yellow-500">★</span>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Clients</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalClients}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Upcoming Visits</h2>
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Calendar</button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {upcomingVisits.map((visit) => (
                                <div key={visit.id} className="p-6 hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                    {new Date(visit.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <h3 className="font-bold text-gray-900">{visit.clientName}</h3>
                                            </div>
                                            <p className="text-gray-600 mb-1">{visit.propertyTitle}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {visit.location}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
                                                Start Visit
                                            </button>
                                            <button className="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition">
                                                Call Client
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {upcomingVisits.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No upcoming visits scheduled for today.
                            </div>
                        )}
                    </div>

                    {/* Recent History */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentCompletedVisits.map((visit) => (
                                <div key={visit.id} className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{visit.clientName}</h4>
                                            <p className="text-sm text-gray-600">{visit.propertyTitle}</p>
                                            <p className="text-xs text-gray-400 mt-1">Completed on {new Date(visit.scheduledTime).toLocaleDateString()}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                            Completed
                                        </span>
                                    </div>
                                    {visit.feedback && (
                                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mt-3">
                                            <div className="flex items-center gap-1 mb-1">
                                                <span className="text-yellow-600 font-bold">{visit.feedback.rating}</span>
                                                <span className="text-yellow-500">★</span>
                                            </div>
                                            <p className="text-sm text-yellow-800 italic">"{visit.feedback.comment}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Quick Actions & Notifications */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3 group">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                                    +
                                </div>
                                <span className="font-medium text-gray-700">Log Ad-hoc Visit</span>
                            </button>
                            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition flex items-center gap-3 group">
                                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition">
                                    📞
                                </div>
                                <span className="font-medium text-gray-700">Contact Support</span>
                            </button>
                        </div>
                    </div>

                    {/* Notifications/Reminders */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Reminders</h2>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-red-500 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Upload site photos</p>
                                    <p className="text-xs text-gray-500">For Visit ID: v4 (Priya Singh)</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Team Meeting</p>
                                    <p className="text-xs text-gray-500">Tomorrow at 10:00 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
