'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { DASHBOARD_ROUTES } from '../lib/routing';

export default function Navbar() {
    const { authenticated, roles, initialized } = useAuth();

    const getDashboardUrl = () => {
        // Preference order for redirection
        const priorityRoles: (keyof typeof DASHBOARD_ROUTES)[] = [
            'central-authority',
            'dsa',
            'consultant',
            'property-partner',
            'marketing-manager',
            'onboarding-manager',
            'loan-adviser',
            'commission-manager',
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
                        <Link href="/#how" className="text-gray-600 hover:text-gray-900">How It Works</Link>
                        <Link href="/#why" className="text-gray-600 hover:text-gray-900">Why Us</Link>
                        <Link href="/search" className="text-gray-600 hover:text-gray-900">Explore All Regions</Link>
                        <Link href="/#recommended" className="text-gray-600 hover:text-gray-900">Properties</Link>
                    </div>
                    <div className="flex gap-3 min-w-[200px] justify-end">
                        <Link href="/search" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">
                            Search Properties
                        </Link>
                        {initialized ? (
                            authenticated ? (
                                <Link href={getDashboardUrl()} className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium border border-blue-100 rounded-lg bg-blue-50/50">
                                    My Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/signin"
                                    className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium"
                                >
                                    Login
                                </Link>
                            )
                        ) : (
                            <div className="w-20 h-8 animate-pulse bg-gray-100 rounded-lg"></div>
                        )}
                        <Link href="/consultation" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap">
                            Free Consultation
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
