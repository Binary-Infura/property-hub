'use client';

import React, { useState } from 'react';
import RouteGuard from '@/app/components/auth/RouteGuard';
import ProfileCompletionPrompt from '@/app/components/ProfileCompletionPrompt';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import UnifiedSidebar from '@/app/components/dashboard/UnifiedSidebar';
import { RoleId } from '@/app/contexts/UnifiedAppContext';

interface UnifiedDashboardLayoutProps {
    children: React.ReactNode;
    requiredRole: RoleId;
    title: string;
}

export default function UnifiedDashboardLayout({
    children,
    requiredRole,
    title,
}: UnifiedDashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <RouteGuard requiredRole={requiredRole}>
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                {/* Mobile Sidebar overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 md:hidden bg-gray-900/50 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <UnifiedSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
                    <DashboardHeader
                        title={title}
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />

                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        <ProfileCompletionPrompt />
                        {children}
                    </main>
                </div>
            </div>
        </RouteGuard>
    );
}
