'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedApp, UserRole } from '../contexts/UnifiedAppContext';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function UnifiedContextSwitcher() {
    const { currentUser, activeContext, switchContext, setIsProfileOpen } = useUnifiedApp();
    const { user, roles, token, logout } = useAuth();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [settingPrimary, setSettingPrimary] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const firstName = user?.given_name || user?.firstName || '';
    const lastName = user?.family_name || user?.lastName || '';
    const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : (user?.name || 'User');
    const { activeRole } = activeContext;
    const activeRoleName = activeRole.name;
    const primaryRoleId = user?.primaryRole as string | undefined;
    const avatarUrl = user
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`
        : currentUser.avatar;

    const rolePrefixes = [
        '/central-authority',
        '/marketing-manager',
        '/onboarding-manager',
        '/property-partner',
        '/broker',
        '/consultant',
        '/loan-adviser',
        '/visit-executive',
        '/dashboard',
        '/influencer'
    ];
    const isOnDashboard = rolePrefixes.some(prefix => pathname?.startsWith(prefix));

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const handleSetPrimary = async (roleId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // don't close the dropdown or fire the role switch
        if (roleId === primaryRoleId) return; // already primary
        setSettingPrimary(roleId);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/profile`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ primaryRole: roleId }),
                }
            );
            if (res.ok) {
                const roleName = currentUser.availableRoles.find(r => r.id === roleId)?.name || roleId;
                showToast(`✓ Primary role set to ${roleName}`);
                // Patch local user object so UI reflects immediately
                if (user) user.primaryRole = roleId;
            }
        } catch {
            showToast('Failed to update primary role');
        } finally {
            setSettingPrimary(null);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Toast notification */}
            {toast && (
                <div className="absolute right-0 -top-12 z-[200] bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200">
                    {toast}
                </div>
            )}

            {/* Header Trigger */}
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
                        {activeRoleName}
                    </span>
                </div>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-[240px] bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden flex flex-col">

                    {/* Role Switcher */}
                    <div className="p-2 border-b border-gray-100 max-h-56 overflow-y-auto custom-scrollbar">
                        <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Switch Role</p>
                        {currentUser.availableRoles.map((role) => {
                            const isActive = activeRole.id === role.id;
                            const isPrimary = primaryRoleId === role.id;
                            const isSetting = settingPrimary === role.id;

                            return (
                                <div
                                    key={role.id}
                                    className={`w-full flex items-center justify-between px-2 py-2 mb-1 rounded-lg transition-colors group ${isActive ? 'bg-blue-50/80 ring-1 ring-blue-100' : 'hover:bg-gray-50'}`}
                                >
                                    {/* Role name button — switches active context */}
                                    <button
                                        onClick={() => { switchContext(role.id as any, isOnDashboard); setIsOpen(false); }}
                                        className="flex items-center gap-2.5 flex-1 text-left px-1"
                                    >
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-blue-600 shadow-sm shadow-blue-200' : 'bg-gray-300'}`}></div>
                                        <div className="flex flex-col">
                                            <span className={`text-[13px] ${isActive ? 'text-blue-700 font-bold' : 'text-gray-700 font-medium'}`}>
                                                {role.name}
                                            </span>
                                            {isPrimary && (
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                                    Primary Login
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Star button — sets as default role (persisted) */}
                                    <button
                                        onClick={(e) => handleSetPrimary(role.id, e)}
                                        title={isPrimary ? 'This is your primary role' : 'Set as primary role on login'}
                                        className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md transition-all ml-2 ${isPrimary
                                            ? 'text-yellow-500 bg-yellow-50'
                                            : 'text-gray-300 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100'
                                            }`}
                                        disabled={isPrimary || isSetting}
                                    >
                                        {isSetting ? (
                                            <svg className="w-3.5 h-3.5 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill={isPrimary ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isPrimary ? 1.5 : 1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Profile Link */}
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

