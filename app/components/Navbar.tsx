'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { DASHBOARD_ROUTES } from '../lib/routing';

export default function Navbar() {
    const { authenticated, user, roles, token, logout, initialized } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const getDashboardUrl = () => {
        // 1. If they have a default role set, definitely use that first
        if (user?.defaultRole && roles.includes(user.defaultRole)) {
            return DASHBOARD_ROUTES[user.defaultRole as keyof typeof DASHBOARD_ROUTES] || '/dashboard';
        }

        // 2. Fallback preference order
        const priorityRoles: (keyof typeof DASHBOARD_ROUTES)[] = [
            'central-authority',
            'broker',
            'consultant',
            'property-partner',
            'marketing-manager',
            'onboarding-manager',
            'loan-adviser',
            'visit-executive',
            'buyer'
        ];

        const foundRole = priorityRoles.find(role => roles.includes(role));
        return foundRole ? DASHBOARD_ROUTES[foundRole] : '/dashboard';
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                        <span className="font-bold text-lg text-gray-900">PropertyHub</span>
                    </Link>
                    <div className="hidden md:flex gap-8">
                        <Link href="/#how" className="text-gray-600 hover:text-gray-900 text-sm font-medium">How It Works</Link>
                        <Link href="/#why" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Why Us</Link>
                        <Link href="/#recommended" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Properties</Link>
                        <Link href="/reels" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Reels</Link>
                        <Link href="/search" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Search</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {initialized ? (
                            authenticated ? (
                                <AuthUserMenu
                                    user={user}
                                    roles={roles}
                                    token={token}
                                    logout={logout}
                                />
                            ) : (
                                <>
                                    <Link href="/signin" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">
                                        Login
                                    </Link>
                                    <Link href="/consultation" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap text-sm">
                                        Free Consultation
                                    </Link>
                                </>
                            )
                        ) : (
                            <div className="w-20 h-8 animate-pulse bg-gray-100 rounded-lg"></div>
                        )}
                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden ml-2 p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
                        <Link href="/#how" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">How It Works</Link>
                        <Link href="/#why" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">Why Us</Link>
                        <Link href="/#recommended" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">Properties</Link>
                        <Link href="/reels" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">Reels</Link>
                        <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">Search</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

function AuthUserMenu({ user, roles, token, logout }: {
    user: any;
    roles: string[];
    token: string | undefined;
    logout: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    const firstName = user?.given_name || user?.firstName || user?.name?.split(' ')[0] || 'User';
    const primaryRole = user?.defaultRole || roles[0];
    const roleLabel = primaryRole
        ? primaryRole.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'User';

    React.useEffect(() => {
        function onOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, []);

    const handleRoleSwitch = async (newRole: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/me/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ defaultRole: newRole })
            });
            window.location.href = newRole === 'buyer' ? '/dashboard' : `/${newRole}/dashboard`;
        } catch { /* silent */ }
    };

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=1d4ed8&color=fff&size=64`;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
            >
                <img src={avatarUrl} alt={firstName} className="w-8 h-8 rounded-full" />
                <div className="hidden sm:flex flex-col items-start text-left leading-none">
                    <span className="text-sm font-semibold text-gray-900">{firstName}</span>
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">{roleLabel}</span>
                </div>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">

                    {/* Dashboard Link */}
                    <div className="py-1 border-b border-gray-100">
                        <Link
                            href={roles.length > 1 ? '/my-dashboards' : (primaryRole === 'buyer' ? '/dashboard' : `/${primaryRole}/dashboard`)}
                            onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            My Dashboard
                        </Link>
                    </div>

                    {/* Role switcher — only if multiple roles */}
                    {roles.length > 1 && (
                        <div className="py-1 border-b border-gray-100">
                            <p className="px-4 pt-2 pb-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">Switch Role</p>
                            {roles.map(role => (
                                <button
                                    key={role}
                                    onClick={() => { setOpen(false); handleRoleSwitch(role); }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${role === primaryRole ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {role.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Logout */}
                    <button
                        onClick={() => { setOpen(false); logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}
