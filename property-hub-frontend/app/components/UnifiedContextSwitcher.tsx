'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedApp } from '../contexts/UnifiedAppContext';
import { useAuth } from '../contexts/AuthContext';
import RoleSwitchTransition from './RoleSwitchTransition';

// Maps each role to the internal Next.js directory slug
const ROLE_URL_MAP: Record<string, string> = {
    CENTRAL_AUTHORITY: '/central-authority',
    MARKETING_MANAGER: '/marketing-manager',
    PROPERTY_PARTNER: '/property-partner',
    CONSULTANT: '/consultant',
    LOAN_ADVISOR: '/loan-adviser',
    BUYER: '/buyer',
    INFLUENCER: '/influencer',
};

export default function UnifiedContextSwitcher() {
    const { currentUser, activeContext, setIsProfileOpen } = useUnifiedApp();
    const { user, logout, switchRole, activeRole: activeRoleId } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [switching, setSwitching] = useState<string | null>(null);
    const [transition, setTransition] = useState<{ visible: boolean; roleId: string; roleName: string }>({
        visible: false, roleId: '', roleName: '',
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { activeRole } = activeContext;
    const firstName = user?.given_name || user?.firstName || '';
    const lastName = user?.family_name || user?.lastName || '';
    const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : (user?.email || 'User');
    const avatarUrl = user
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`
        : currentUser.avatar;

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

        // Step 1: Show spinner on the button while API call is in-flight
        setSwitching(roleId);
        setIsOpen(false);

        try {
            // Step 2: Wait for the API to complete — verifies JWT, updates localStorage + cookie
            await switchRole(roleId);

            // Step 3: API succeeded → show the full-screen animation
            setTransition({ visible: true, roleId, roleName });

            // Step 4: Wait for animation to fully complete, then navigate.
            // Use /dashboard — middleware rewrites it to the correct role in ONE step.
            // (Navigating directly to /central-authority causes a redirect loop: 
            //  middleware cleanup redirects it back to /dashboard anyway.)
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1800);
        } catch (err: any) {
            // On failure: clear spinner, no animation, show error
            setSwitching(null);
            console.error('Role switch failed:', err);
            alert(err?.message || 'Failed to switch role. Please try again.');
        }
    };

    return (
        <>
            <RoleSwitchTransition
                isVisible={transition.visible}
                roleId={transition.roleId}
                roleName={transition.roleName}
            />

            <div className="relative" ref={dropdownRef}>
                {/* Trigger button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-sm font-semibold text-gray-900">{displayName}</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                            {activeRole.name}
                        </span>
                    </div>
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-[240px] bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden flex flex-col">

                        {/* Role list */}
                        <div className="p-2 border-b border-gray-100 max-h-56 overflow-y-auto">
                            <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Switch Role
                            </p>
                            {currentUser.availableRoles.map((role) => {
                                const isActive = activeRoleId === role.id;
                                const isSwitching = switching === role.id;

                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => handleSwitch(role.id)}
                                        disabled={isActive || !!switching}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 mb-1 rounded-lg text-left transition-colors ${isActive
                                            ? 'bg-blue-50/80 ring-1 ring-blue-100 cursor-default opacity-80'
                                            : switching
                                                ? 'opacity-40 cursor-not-allowed'
                                                : 'hover:bg-gray-50 cursor-pointer'
                                        }`}
                                    >
                                        {/* Active indicator dot */}
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${isActive ? 'bg-blue-600 shadow-sm shadow-blue-200' : 'bg-gray-300'}`} />

                                        <div className="flex flex-col flex-1">
                                            <span className={`text-[13px] font-medium ${isActive ? 'text-blue-700 font-bold' : 'text-gray-700'}`}>
                                                {role.name}
                                            </span>
                                            {isActive && (
                                                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mt-0.5">
                                                    Active
                                                </span>
                                            )}
                                        </div>

                                        {/* Spinner when this role is being activated */}
                                        {isSwitching && (
                                            <svg className="w-3.5 h-3.5 animate-spin text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Profile link */}
                        <div className="p-2 border-b border-gray-100">
                            <button
                                onClick={() => { setIsProfileOpen(true); setIsOpen(false); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[13px] font-bold text-gray-700">My Profile</span>
                                    <span className="text-[10px] text-gray-400 mt-1 font-medium">Manage your account</span>
                                </div>
                            </button>
                        </div>

                        {/* Logout */}
                        <div className="p-2 bg-gray-50">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
