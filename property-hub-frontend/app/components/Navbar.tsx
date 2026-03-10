'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useConsultingBucket } from '../contexts/ConsultingBucketContext';
import { useUnifiedApp } from '../contexts/UnifiedAppContext';
import { DASHBOARD_ROUTES } from '../lib/routing';

export default function Navbar() {
    const { authenticated, user, roles, token, logout, initialized } = useAuth();
    const { itemCount, items, removeItem } = useConsultingBucket();
    const { activeContext } = useUnifiedApp();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isBucketOpen, setIsBucketOpen] = useState(false);
    const bucketRef = useRef<HTMLDivElement>(null);

    const isBuyer = (activeContext?.activeRole?.id === 'BUYER') && authenticated;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (bucketRef.current && !bucketRef.current.contains(event.target as Node)) {
                setIsBucketOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    return (
        <nav className="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                        <span className="font-bold text-lg text-gray-900">PropertyHub</span>
                    </Link>
                    <div className="hidden md:flex gap-8">
                        <Link href="/#how" className="text-gray-600 hover:text-gray-900 text-sm font-medium">How It Works</Link>
                        <Link href="/#why" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Why Us</Link>

                        <Link href="/reels" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Reels</Link>
                        <Link href="/search" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Search</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {isBuyer && (
                            <div className="relative mr-2" ref={bucketRef}>
                                <button
                                    onClick={() => setIsBucketOpen(!isBucketOpen)}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {itemCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                            {itemCount}
                                        </span>
                                    )}
                                </button>

                                {isBucketOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Consulting Bucket</span>
                                            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-black">{itemCount} items</span>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                            {items.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-400">Your bucket is empty</p>
                                                    <Link href="/search" onClick={() => setIsBucketOpen(false)} className="text-xs text-blue-600 font-black mt-2 inline-block hover:underline">Browse Properties</Link>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-50">
                                                    {items.map((item) => (
                                                        <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors group">
                                                            <div className="flex justify-between items-start gap-3">
                                                                <div className="flex-1">
                                                                    <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                                                        <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                        </svg>
                                                                        {item.location}
                                                                    </div>
                                                                    <p className="text-xs font-black text-blue-600 mt-2">{item.price}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {items.length > 0 && (
                                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                                <Link
                                                    href={authenticated ? '/dashboard/saved' : '/consultation'}
                                                    onClick={() => setIsBucketOpen(false)}
                                                    className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black tracking-widest uppercase text-center block shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
                                                >
                                                    View All
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {initialized ? (
                            authenticated ? (
                                <AuthUserMenu
                                    user={user}
                                    roles={roles}
                                    token={token}
                                    logout={logout}
                                    activeRole={activeContext.activeRole}
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

                        <Link href="/reels" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">Reels</Link>
                        <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">Search</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

function AuthUserMenu({ user, roles, token, logout, activeRole }: {
    user: any;
    roles: string[];
    token: string | undefined;
    logout: () => void;
    activeRole: any;
}) {
    const { switchContext } = useUnifiedApp();
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);
    const firstName = user?.firstName || user?.name?.split(' ')[0] || 'User';
    const roleLabel = activeRole?.name || 'User';

    React.useEffect(() => {
        function onOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, []);

    const handleRoleSwitch = async (newRole: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ primaryRole: newRole })
            });
            // Use unified context switcher logic instead of hard reload
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
            switchContext(newRole as any, isOnDashboard);
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
                            href={roles.length > 1 ? '/my-dashboards' : (DASHBOARD_ROUTES[activeRole?.id] || '/dashboard')}
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
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${role === activeRole?.id ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {role.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
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
