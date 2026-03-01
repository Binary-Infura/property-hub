"use client";

import React, { useState } from 'react';

// Mock data for site visits
const initialVisits = [
    {
        id: '1',
        clientName: 'Rahul Sharma',
        phone: '+91 9876543210',
        propertyTitle: 'Sunset Towers',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        time: '10:00 AM',
        status: 'Scheduled',
        type: 'Site Visit'
    },
    {
        id: '2',
        clientName: 'Priya Desai',
        phone: '+91 9123456789',
        propertyTitle: 'Green Valley Homes',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        time: '02:30 PM',
        status: 'Scheduled',
        type: 'Follow Up'
    },
    {
        id: '3',
        clientName: 'Amit Patel',
        phone: '+91 9988776655',
        propertyTitle: 'Luxury Heights',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        time: '11:00 AM',
        status: 'Completed',
        type: 'Site Visit'
    },
    {
        id: '4',
        clientName: 'Sneha Gupta',
        phone: '+91 9876501234',
        propertyTitle: 'Sunset Towers',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        time: '04:00 PM',
        status: 'Scheduled',
        type: 'Initial Consultation'
    },
];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDayName = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    };

    const getFormattedDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Sort visits by date
    const sortedVisits = [...initialVisits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Calendar & Visits</h1>
                        <p className="text-gray-600 mt-1">Manage your upcoming site visits and consultations</p>
                    </div>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Schedule Visit
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Focus Dates</h2>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 cursor-pointer">
                                    <div className="font-semibold text-blue-900">Today</div>
                                    <div className="text-sm text-blue-700 mt-1">You have 1 visit scheduled</div>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="font-semibold text-gray-900">Tomorrow</div>
                                    <div className="text-sm text-gray-600 mt-1">You have 2 visits scheduled</div>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="font-semibold text-gray-900">This Week</div>
                                    <div className="text-sm text-gray-600 mt-1">You have 4 visits scheduled</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 text-white text-center">
                            <h3 className="font-bold text-xl mb-2">Performance Tracking</h3>
                            <p className="text-blue-100 text-sm mb-4">Complete your pending site visits to boost your conversion rate.</p>
                            <div className="w-full bg-blue-900/50 rounded-full h-2 mb-2">
                                <div className="bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <p className="text-xs text-blue-100">75% of scheduled visits completed this week</p>
                        </div>
                    </div>

                    {/* Visits List */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {sortedVisits.map((visit) => (
                                <div key={visit.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md flex flex-col sm:flex-row gap-4">
                                    <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start sm:w-32 sm:border-r border-gray-100 sm:pr-4">
                                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{getDayName(visit.date).substring(0, 3)}</div>
                                        <div className="text-2xl font-bold text-gray-900">{new Date(visit.date).getDate()}</div>
                                        <div className="text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded mt-2 ml-4 sm:ml-0">
                                            {visit.time}
                                        </div>
                                    </div>

                                    <div className="flex-grow flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{visit.type} - {visit.propertyTitle}</h3>
                                                <div className="flex items-center text-gray-600 text-sm mt-1 gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Client: {visit.clientName} ({visit.phone})
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(visit.status)}`}>
                                                {visit.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex gap-3">
                                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                                View Details
                                            </button>
                                            <button className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                                                Reschedule
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 text-center">
                            <button className="text-gray-500 font-medium hover:text-blue-600 transition-colors bg-white px-6 py-3 rounded-lg border border-gray-200 shadow-sm hover:shadow">
                                Load More Visits
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
