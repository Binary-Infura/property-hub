'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedApp } from '../contexts/UnifiedAppContext';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

export default function UserProfileMenu() {
    const { currentUser, activeContext, triggerTransition } = useUnifiedApp();
    const { user, profileStatus, logout, switchRole, activeRole: activeRoleId } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [switching, setSwitching] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { activeRole } = activeContext;
    const firstName = user?.firstName || user?.name?.split(' ')[0] || user?.given_name || 'User';
    const lastName = user?.lastName || user?.name?.split(' ').slice(1).join(' ') || user?.family_name || '';
    const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : (user?.email || 'User');
    
    // Prioritize organization name for Property Partners
    const companyName = (activeRoleId === 'PROPERTY_PARTNER' && profileStatus?.PROPERTY_PARTNER?.profileData?.companyName)
        ? profileStatus.PROPERTY_PARTNER.profileData.companyName
        : null;

    const roleLabel = companyName || activeRole?.name || 'User';

    const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1d4ed8&color=fff&size=128`;

    // Close dropdown on outside click
    useEffect(() => {
        function onOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, []);

    const handleSwitch = async (roleId: string) => {
        if (roleId === activeRoleId || switching) return;

        const roleName = currentUser.availableRoles.find(r => r.id === roleId)?.name ?? roleId;

        setSwitching(roleId);
        setIsOpen(false);

        try {
            await switchRole(roleId);
            triggerTransition(roleId, roleName);
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1800);
        } catch (err: any) {
            setSwitching(null);
            console.error('Role switch failed:', err);
            alert(err?.message || 'Failed to switch role');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
                {/* Trigger button - Premium Aura Bloom Style */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border border-gray-100 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 group shadow-sm hover:shadow-md"
                >
                    <div className="relative">
                        <img 
                            src={avatarUrl} 
                            alt={displayName} 
                            className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    
                    <div className="hidden sm:flex flex-col items-start leading-tight">
                        <span className="text-sm font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">{firstName}</span>
                        <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.1em]">
                            {roleLabel}
                        </span>
                    </div>

                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown - Premium Aura Bloom Style */}
                {isOpen && (
                    <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-[100] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        
                        {/* User Header Section */}
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <img src={avatarUrl} alt={displayName} className="w-12 h-12 rounded-2xl shadow-lg border-2 border-white" />
                                <div>
                                    <h4 className="font-black text-gray-900 leading-none">{displayName}</h4>
                                    <p className="text-[11px] text-blue-600 font-black uppercase tracking-widest mt-1.5">{roleLabel}</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className={`p-3 border-b border-gray-100 grid ${activeContext.activeRole.id === 'PROPERTY_PARTNER' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                             <Link
                                href="/dashboard/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-blue-50 transition-all group border border-transparent hover:border-blue-100"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Profile</span>
                            </Link>

                            {activeContext.activeRole.id === 'PROPERTY_PARTNER' && (
                                <Link
                                    href="/dashboard/organization"
                                    onClick={() => setIsOpen(false)}
                                    className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-emerald-50 transition-all group border border-transparent hover:border-emerald-100"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Organization</span>
                                </Link>
                            )}

                            <Link
                                href="/dashboard"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsOpen(false);
                                    const roleId = activeRole?.id || 'BUYER';
                                    const roleName = activeRole?.name || 'User';
                                    triggerTransition(roleId, roleName);
                                    setTimeout(() => {
                                        window.location.href = '/dashboard';
                                    }, 1800);
                                }}
                                className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-indigo-50 transition-all group border border-transparent hover:border-indigo-100"
                            >
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Dashboard</span>
                            </Link>
                        </div>

                        {/* Role list */}
                        <div className="p-4 border-b border-gray-100">
                            <p className="px-3 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                Available Roles
                            </p>
                            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {currentUser.availableRoles.map((role) => {
                                    const isActive = activeRoleId === role.id;
                                    const isSwitching = switching === role.id;

                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => handleSwitch(role.id)}
                                            disabled={isActive || !!switching}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                : switching
                                                    ? 'opacity-40 cursor-not-allowed'
                                                    : 'hover:bg-gray-50 text-gray-600 hover:text-blue-600'
                                            }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
                                            <span className={`text-xs font-bold uppercase tracking-wide flex-1 text-left`}>
                                                {role.name}
                                            </span>
                                            {isSwitching && (
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Logout Section */}
                        <div className="p-4 bg-red-50/50">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-red-600 bg-white border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 uppercase tracking-widest"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
    );
}
