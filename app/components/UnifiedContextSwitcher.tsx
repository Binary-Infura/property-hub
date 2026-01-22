'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedApp, UserRole, Region } from '../contexts/UnifiedAppContext';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';

export default function UnifiedContextSwitcher() {
    const { currentUser, activeContext, switchContext } = useUnifiedApp();
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Selection State (local state for the dropdown before confirming switch)
    const [selectedRegionId, setSelectedRegionId] = useState<string>(activeContext.activeRegion.id);
    const [selectedRoleId, setSelectedRoleId] = useState<string>(activeContext.activeRole.id);

    // Sync local state when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setSelectedRegionId(activeContext.activeRegion.id);
            setSelectedRoleId(activeContext.activeRole.id);
        }
    }, [isOpen, activeContext]);

    const selectedRegion = currentUser.availableRegions.find(r => r.id === selectedRegionId);
    const selectedRole = selectedRegion?.roles.find(r => r.id === selectedRoleId);

    const handleSwitch = () => {
        if (selectedRegion && selectedRole) {
            switchContext(selectedRegion.id, selectedRole.id);
            setIsOpen(false);
        }
    };

    // Helper to get selected region details for display
    const currentRegionDisplay = currentUser.availableRegions.find(r => r.id === selectedRegionId) || activeContext.activeRegion;
    const currentRoleDisplay = currentRegionDisplay.roles.find(r => r.id === selectedRoleId) || activeContext.activeRole;


    return (
        <div className="relative" ref={dropdownRef}>
            {/* Header Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-gray-900">
                        {activeContext.activeRole.name}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                        {activeContext.activeRegion.name}
                    </span>
                </div>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[550px] bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 origin-top-right">

                    <div className="flex flex-1 h-[320px]">
                        {/* Section 1: Regions (Primary Selector) */}
                        <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
                            <div className="p-3 border-b border-gray-100">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Regions</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {currentUser.availableRegions.map(region => (
                                    <button
                                        key={region.id}
                                        onClick={() => {
                                            setSelectedRegionId(region.id);
                                            // Reset role when region changes to the first available role in that region
                                            if (region.roles.length > 0) {
                                                setSelectedRoleId(region.roles[0].id);
                                            }
                                        }}
                                        className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-all ${selectedRegionId === region.id
                                            ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-200'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{region.name}</span>
                                            {selectedRegionId === region.id && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 2: Roles (Contextual to Region) */}
                        <div className="w-2/3 flex flex-col bg-white">
                            <div className="p-3 border-b border-gray-100">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Available Roles in <span className="text-gray-900">{selectedRegion?.name}</span>
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {selectedRegion?.roles.map(role => (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRoleId(role.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all group ${selectedRoleId === role.id
                                            ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 p-1.5 rounded-md ${selectedRoleId === role.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                                }`}>
                                                {/* Role Icon Placeholder - simple logic based on role name */}
                                                {role.id.includes('manager') && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                                {role.id.includes('partner') && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                                                {role.id === 'buyer' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                                            </div>
                                            <div>
                                                <h4 className={`font-semibold text-sm ${selectedRoleId === role.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                                    {role.name}
                                                </h4>
                                                <p className={`text-xs mt-0.5 ${selectedRoleId === role.id ? 'text-blue-700' : 'text-gray-500'}`}>
                                                    {role.permissionHint}
                                                </p>
                                            </div>
                                            {selectedRoleId === role.id && (
                                                <div className="ml-auto flex items-center h-full">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Active Context Summary & Action */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Switching to</span>
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                <span className="font-semibold">{currentRegionDisplay?.name}</span>
                                <span className="text-gray-400">•</span>
                                <span>{currentRoleDisplay?.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                            >
                                <svg className="w-4 h-4 text-red-500 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                            </button>
                            <button
                                onClick={handleSwitch}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition shadow-sm active:transform active:scale-95 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            >
                                Switch Context
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
