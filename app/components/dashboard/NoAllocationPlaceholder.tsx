'use client';

import React from 'react';
import { useUnifiedApp } from '../../contexts/UnifiedAppContext';

export default function NoAllocationPlaceholder() {
    const { activeContext } = useUnifiedApp();
    const activeRoleId = activeContext.activeRole.id;
    const cityBasedRoles = [
        'onboarding-manager',
        'marketing-manager',
        'consultant',
        'visit-executive',
        'loan-adviser',
        'dsa'
    ];
    const isCityBased = cityBasedRoles.includes(activeRoleId);
    const label = 'City';
    const pluralLabel = 'Cities';
    const scopeLabel = 'city-wide';

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden group">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>

                <div className="relative p-12 flex flex-col items-center text-center">
                    {/* Pulsing Icon Container */}
                    <div className="relative mb-10">
                        <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-200 transform group-hover:scale-105 transition-transform duration-500">
                            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        Allocation Required
                    </h1>

                    <p className="text-gray-500 text-lg max-w-md leading-relaxed mb-10">
                        Your account is verified, but you haven't been assigned to any <span className="text-blue-600 font-bold">{pluralLabel.toLowerCase()}</span> yet.
                        Assignments are managed by the Central Authority.
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="group relative px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold overflow-hidden transition-all hover:shadow-2xl hover:shadow-gray-200 active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative flex items-center gap-2">
                            Refresh Connection
                            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </span>
                    </button>

                    <div className="mt-16 w-full pt-10 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row gap-8 justify-center items-start text-left">
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Permissions</p>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    Your role requires a <span className="text-gray-900 font-bold">{scopeLabel}</span> jurisdiction to access properties and partner data.
                                </p>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">Next Step</p>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    Contact your administrator to map your profile to a specific metropolitan zone.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
