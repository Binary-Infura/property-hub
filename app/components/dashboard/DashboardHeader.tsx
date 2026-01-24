'use client';

import Link from 'next/link';
import UnifiedContextSwitcher from '@/app/components/UnifiedContextSwitcher';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface DashboardHeaderProps {
    title?: string;
    breadcrumbs?: BreadcrumbItem[];
    showSearch?: boolean;
    showNotifications?: boolean;
    showLogo?: boolean;
    children?: React.ReactNode;
}

/**
 * Common Header for all Roles
 * Provides a consistent layout with Page Title/Breadcrumbs and Context Switcher
 */
export default function DashboardHeader({
    title,
    breadcrumbs = [],
    showSearch = false,
    showNotifications = false,
    showLogo = false,
    children
}: DashboardHeaderProps) {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 h-16 shrink-0">
            <div className="h-full px-8 flex items-center justify-between">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    {/* Logo for states without sidebar */}
                    {showLogo && (
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 mr-2 shrink-0">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                            <span className="hidden sm:inline">PropertyHub</span>
                        </Link>
                    )}

                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Breadcrumbs or Title */}
                        {breadcrumbs.length > 0 ? (
                            <nav className="flex items-center gap-2 text-sm text-gray-600 truncate">
                                {breadcrumbs.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 min-w-0">
                                        {idx > 0 && <span className="text-gray-400">/</span>}
                                        {item.href ? (
                                            <a href={item.href} className="text-gray-600 hover:text-gray-900 transition truncate">
                                                {item.label}
                                            </a>
                                        ) : (
                                            <span className="text-gray-900 font-semibold truncate">{item.label}</span>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        ) : (
                            title && (
                                <h2 className="text-xl font-semibold text-gray-800 tracking-tight truncate">
                                    {title}
                                </h2>
                            )
                        )}
                        {children}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Search Bar */}
                    {showSearch && (
                        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Quick search..."
                                className="bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none w-48"
                            />
                        </div>
                    )}

                    {/* Notifications */}
                    {showNotifications && (
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition relative">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    )}

                    <UnifiedContextSwitcher />
                </div>
            </div>
        </header>
    );
}
