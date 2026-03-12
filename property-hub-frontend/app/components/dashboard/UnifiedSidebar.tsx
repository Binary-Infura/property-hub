'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SidebarIcon from '@/app/components/SidebarIcon';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { NAVIGATION_CONFIG } from '@/app/config/navigation';

interface UnifiedSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UnifiedSidebar({ isOpen, onClose }: UnifiedSidebarProps) {
    const pathname = usePathname();
    const { activeContext, setIsProfileOpen } = useUnifiedApp();
    const { profileStatus } = useAuth();

    const { activeRole } = activeContext;
    const navigation = NAVIGATION_CONFIG[activeRole.id] || [];

    const isActive = (href: string) => {
        if (href.endsWith('/dashboard')) {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    const isPremium = profileStatus?.[activeRole.id]?.profileData?.isPremium;

    // Split Property Partner nav into main and advanced if needed
    const mainNav = activeRole.id === 'PROPERTY_PARTNER'
        ? navigation.filter(item => !item.premium)
        : navigation;

    const advancedNav = activeRole.id === 'PROPERTY_PARTNER'
        ? navigation.filter(item => item.premium)
        : [];

    const getRoleTheme = (roleId: string) => {
        return {
            bg: 'bg-blue-600',
            text: 'text-white',
            border: 'border-blue-400',
            hover: 'hover:bg-blue-700'
        };
    };

    const theme = getRoleTheme(activeRole.id);
    const isDarkSidebar = true;

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 ${isDarkSidebar ? 'bg-slate-900 border-gray-800' : 'bg-white border-gray-200'} border-r transition-all duration-300 ease-in-out md:relative md:flex flex-col shrink-0 shadow-sm ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className={`h-16 flex items-center justify-between px-6 border-b ${isDarkSidebar ? 'border-gray-800' : 'border-gray-100'}`}>
                <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <div className="w-3 h-3 bg-white rounded-sm rotate-45"></div>
                    </div>
                    <span className={isDarkSidebar ? 'text-white' : 'text-gray-900'}>PropertyHub</span>
                </Link>
                <button className="md:hidden text-gray-400 hover:text-gray-900 transition-colors" onClick={onClose}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
                <nav className="px-3 space-y-1">
                    {mainNav.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${active
                                    ? `${theme.bg} ${theme.text} shadow-sm border-l-[3px] ${theme.border}`
                                    : `${isDarkSidebar ? 'text-gray-400 hover:bg-slate-800 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                                    }`}
                            >
                                <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    <SidebarIcon name={item.icon as any} />
                                </div>
                                <span className="text-sm">{item.name}</span>
                            </Link>
                        );
                    })}


                </nav>

                {advancedNav.length > 0 && (
                    <div className="mt-8 px-3">
                        <div className="px-4 mb-3 flex justify-between items-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] opacity-70">Premium Tools</p>
                            {!isPremium && (
                                <div className="p-1 bg-amber-100 rounded-md">
                                    <SidebarIcon name="lock" className="w-3 h-3 text-amber-600" />
                                </div>
                            )}
                        </div>
                        <nav className="space-y-1">
                            {advancedNav.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                                            ? 'bg-amber-50 text-amber-700 border-l-[3px] border-amber-500 shadow-sm'
                                            : `${isDarkSidebar ? 'text-gray-400 hover:bg-slate-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`
                                            } ${!isPremium ? 'opacity-60 saturate-50' : ''}`}
                                    >
                                        <div className="relative">
                                            <SidebarIcon name={item.icon as any} className="w-[18px] h-[18px]" />
                                            {!isPremium && (
                                                <div className="absolute -top-1 -right-1 bg-white rounded-full p-[2px] shadow-sm">
                                                    <svg className="w-2.5 h-2.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>

            <div className={`p-4 border-t ${isDarkSidebar ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className={`p-4 rounded-2xl ${isDarkSidebar ? 'bg-slate-800/50' : 'bg-blue-50/50'} border ${isDarkSidebar ? 'border-gray-700' : 'border-blue-100'}`}>
                    <p className={`text-[11px] font-bold ${isDarkSidebar ? 'text-gray-400' : 'text-blue-600'} uppercase mb-1 tracking-wider`}>Need Support?</p>
                    <p className={`text-[10px] ${isDarkSidebar ? 'text-gray-500' : 'text-gray-600'} leading-relaxed`}>Dedicated manager available 24/7 for our partners.</p>
                </div>
            </div>
        </aside>
    );
}
