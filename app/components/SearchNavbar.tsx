'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { DASHBOARD_ROUTES } from '../lib/routing';

export default function SearchNavbar() {
    const { authenticated, roles, initialized } = useAuth();

    const getDashboardUrl = () => {
        const priorityRoles: (keyof typeof DASHBOARD_ROUTES)[] = [
            'central-authority',
            'regional-manager',
            'consultant',
            'marketing-manager',
            'onboarding-manager',
            'loan-adviser',
            'commission-manager',
            'channel-partner',
            'visit-executive',
            'buyer'
        ];

        const foundRole = priorityRoles.find(role => roles.includes(role));
        return foundRole ? DASHBOARD_ROUTES[foundRole] : '/dashboard';
    };

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-blue-600">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                        PropertyHub
                    </Link>
                    <div className="flex items-center gap-6">
                        {initialized ? (
                            authenticated ? (
                                <Link href={getDashboardUrl()} className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                                    My Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href="/signin"
                                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                >
                                    Login
                                </Link>
                            )
                        ) : (
                            <div className="w-20 h-4 animate-pulse bg-gray-100 rounded"></div>
                        )}
                        <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
