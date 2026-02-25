'use client';

import { useState } from 'react';

interface Visit {
    id: string;
    clientName: string;
    propertyTitle: string;
    location: string;
    scheduledTime: string; // ISO string
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export default function SchedulePage() {
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Mock Data
    const allVisits: Visit[] = [
        {
            id: 'v1',
            clientName: 'Rahul Sharma',
            propertyTitle: 'Sunset Heights, 3BHK',
            location: 'Andheri West, Mumbai',
            scheduledTime: new Date(new Date().setHours(14, 0)).toISOString(),
            status: 'scheduled',
        },
        {
            id: 'v2',
            clientName: 'Sneha Gupta',
            propertyTitle: 'Green Valley, Villa 4',
            location: 'Powai, Mumbai',
            scheduledTime: new Date(new Date().setHours(16, 30)).toISOString(),
            status: 'scheduled',
        },
        {
            id: 'v3',
            clientName: 'Amit Verma',
            propertyTitle: 'Ocean View, 2BHK',
            location: 'Worli, Mumbai',
            scheduledTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
            status: 'scheduled',
        },
    ];

    const filteredVisits = allVisits.filter(v => v.scheduledTime.startsWith(selectedDate));

    // Generate next 7 days for the date picker
    const next7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    });

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
                <p className="text-gray-600 mt-2">View and manage your daily visit schedule.</p>
            </div>

            {/* Date Selector */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {next7Days.map((date) => {
                    const d = new Date(date);
                    const isSelected = date === selectedDate;
                    return (
                        <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border transition ${isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                        >
                            <span className="text-xs font-medium uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="text-xl font-bold">{d.getDate()}</span>
                        </button>
                    );
                })}
            </div>

            {/* Timeline/Schedule List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h2>
                </div>

                {filteredVisits.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-4xl mb-4 text-gray-300">
                            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-900 font-medium text-lg">No visits scheduled</p>
                        <p className="text-gray-500">Enjoy your free time!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredVisits.map((visit) => (
                            <div key={visit.id} className="p-6 flex group hover:bg-gray-50 transition">
                                <div className="flex flex-col items-center mr-6 min-w-[4rem]">
                                    <span className="text-sm font-semibold text-gray-500">
                                        {new Date(visit.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div className="h-full w-0.5 bg-gray-200 mt-2 group-last:hidden"></div>
                                </div>

                                <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg">{visit.clientName}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${visit.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                            }`}>
                                            {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 font-medium mb-1">{visit.propertyTitle}</p>
                                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-4">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg> {visit.location}
                                    </p>

                                    <div className="flex gap-2">
                                        <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
                                            Check In
                                        </button>
                                        <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
                                            Directions
                                        </button>
                                        <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">
                                            Call
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
