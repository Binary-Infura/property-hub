'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedApp, UserRole, Region } from '../contexts/UnifiedAppContext';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';

export default function UnifiedContextSwitcher() {
    const { currentUser, activeContext, switchContext } = useUnifiedApp();
    const { user, roles, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Calculate display name and role
    const firstName = user?.given_name || user?.firstName || '';
    const lastName = user?.family_name || user?.lastName || '';
    const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : (user?.name || 'User');
    const isCentralAuthority = roles.includes('central-authority');
    const activeRoleName = activeContext.activeRole.name;
    const isCityBased = activeContext.activeRole.id === 'onboarding-manager' || activeContext.activeRole.id === 'marketing-manager';
    const isNoAllocation = activeContext.activeRegion.id === 'no-region';
    const activeRegionName = isCityBased
        ? (isNoAllocation ? 'No City Allocated' : (activeContext.activeRegion.city || activeContext.activeRegion.name))
        : activeContext.activeRegion.name;

    // Avatar URL - use user's name for a better fallback
    const avatarUrl = user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff` : currentUser.avatar;

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

    // Sync local state when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setSelectedRegionId(activeContext.activeRegion.id);
        }
    }, [isOpen, activeContext]);

    // Check for restricted roles
    const hasCAAccess = currentUser.availableRoles.some(r => r.id === 'central-authority');
    const isBuyer = activeContext.activeRole.id === 'buyer';
    const isPropertyPartner = activeContext.activeRole.id === 'property-partner';
    const isRestricted = hasCAAccess || isBuyer || isPropertyPartner;

    const selectedRegion = currentUser.availableRegions.find(r => r.id === selectedRegionId);

    const handleSwitch = () => {
        if (selectedRegion) {
            switchContext(selectedRegion.id, activeContext.activeRole.id);
            setIsOpen(false);
        }
    };

    // Helper to get selected region details for display
    const currentRegionDisplay = currentUser.availableRegions.find(r => r.id === selectedRegionId) || activeContext.activeRegion;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Header Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold text-gray-900">
                        {displayName}
                    </span>
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                            {activeRoleName}
                        </span>
                        {!isRestricted && (
                            <span className="text-[10px] text-blue-600 font-medium">
                                {activeRegionName}
                            </span>
                        )}
                    </div>
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
                <div className={`absolute right-0 top-full mt-2 ${isRestricted ? 'w-[200px]' : 'w-[280px]'} bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 origin-top-right`}>
                    {!isRestricted && (
                        <div className="flex flex-col h-[320px]">
                            <div className="p-3 border-b border-gray-100 bg-gray-50">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{isCityBased ? 'Cities' : 'Regions'}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {(() => {
                                    const displayedItems = isCityBased
                                        ? currentUser.availableRegions
                                            
                                            .filter((region, index, self) =>
                                                index === self.findIndex((r) => (r.city || r.name) === (region.city || region.name))
                                            )
                                        : currentUser.availableRegions;

                                    return displayedItems.map(region => {
                                        const displayName = isCityBased ? (region.city || region.name) : region.name;
                                        const isSelected = isCityBased
                                            ? (currentRegionDisplay?.city || currentRegionDisplay?.name) === displayName
                                            : selectedRegionId === region.id;

                                        return (
                                            <button
                                                key={region.id}
                                                onClick={() => setSelectedRegionId(region.id)}
                                                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-all ${isSelected
                                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center font-bold">
                                                    <span>{region.id === 'no-region' && isCityBased ? 'No City Allocated' : displayName}</span>
                                                    {isSelected && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 ring-4 ring-blue-50"></div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Section 3: Active Context Summary & Action */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-3">
                        {!isRestricted && (
                            <>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Switching to</span>
                                    <div className="flex items-center gap-2 text-sm text-gray-900">
                                        <span className="font-semibold">
                                            {isCityBased && currentRegionDisplay?.id === 'no-region'
                                                ? 'No City Allocated'
                                                : (isCityBased ? (currentRegionDisplay?.city || currentRegionDisplay?.name) : currentRegionDisplay?.name)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSwitch}
                                    className="w-full bg-blue-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition shadow-sm active:transform active:scale-95 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                >
                                    Switch Context
                                </button>
                            </>
                        )}
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                        >
                            <svg className="w-4 h-4 text-red-500 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
