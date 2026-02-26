'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedApp, UserRole } from '../contexts/UnifiedAppContext';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';

export default function UnifiedContextSwitcher() {
    const { currentUser, activeContext, switchContext, myCities, switchCity } = useUnifiedApp();
    const { user, roles, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const firstName = user?.given_name || user?.firstName || '';
    const lastName = user?.family_name || user?.lastName || '';
    const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : (user?.name || 'User');
    const activeRoleName = activeContext.activeRole.name;
    const { activeRole, activeCity } = activeContext;
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

    // Check for restricted roles
    // const isRestricted = true; // Region switching is removed

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
                            {activeRoleName} {activeCity ? `• ${activeCity.cityName}` : ''}
                        </span>
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
                <div className="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 origin-top-right">

                    {/* Role Switcher */}
                    <div className="p-2 border-b border-gray-100 max-h-48 overflow-y-auto custom-scrollbar">
                        <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Switch Role</p>
                        {currentUser.availableRoles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => {
                                    switchContext(role.id as any);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeRole.id === role.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${activeRole.id === role.id ? 'bg-blue-600 shadow-sm shadow-blue-200' : 'bg-gray-200'}`}></div>
                                {role.name}
                            </button>
                        ))}
                    </div>

                    {/* City Switcher for Managers */}
                    {['marketing-manager', 'onboarding-manager'].includes(activeRole.id) && (
                        <div className="p-2 border-b border-gray-100 max-h-64 overflow-y-auto custom-scrollbar">
                            <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Switch City</p>
                            {myCities.length === 0 ? (
                                <p className="px-3 py-4 text-xs text-gray-400 italic text-center">No cities allocated</p>
                            ) : (
                                myCities.map((city) => (
                                    <button
                                        key={city.id}
                                        onClick={() => {
                                            switchCity(city);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${activeCity?.cityName === city.cityName ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex flex-col items-start text-left">
                                            <span>{city.cityName}</span>
                                            <span className="text-[10px] text-gray-400">{city.stateCode}</span>
                                        </div>
                                        {activeCity?.cityName === city.cityName && (
                                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* Section: Logout */}
                    <div className="p-2 bg-gray-50">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
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
