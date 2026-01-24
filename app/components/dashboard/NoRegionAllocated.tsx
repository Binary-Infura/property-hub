'use client';

import React from 'react';

export default function NoRegionAllocated() {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
                <span className="text-4xl text-blue-600">📍</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Region Allocated</h1>
            <p className="text-gray-500 max-w-md text-balance">
                You currently don't have any regions assigned to your account.
                Please reach out to the <b>Central Authority</b> to request access to a region.
            </p>
            <div className="mt-10 flex gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    Refresh Status
                </button>
            </div>
            <div className="mt-12 pt-12 border-t border-gray-100 w-full max-w-sm">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-4">Why am I seeing this?</p>
                <ul className="text-sm text-gray-500 space-y-3 text-left">
                    <li className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Your account is active but lacks regional scope permissions.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        <span>Region assignments are managed at the system level.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
