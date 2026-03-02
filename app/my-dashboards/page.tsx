'use client';

import { useUnifiedApp } from '../contexts/UnifiedAppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export default function MyDashboards() {
    const { currentUser, switchContext } = useUnifiedApp();
    const { authenticated, initialized } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (initialized && !authenticated) {
            router.push('/signin');
        }
    }, [initialized, authenticated, router]);

    if (!initialized || !authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl w-full space-y-10">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Select Your Workspace</h1>
                        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                            You have access to multiple roles within PropertyHub. Please select the dashboard you would like to open.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {currentUser.availableRoles.map(role => (
                            <div key={role.id}
                                onClick={() => switchContext(role.id)}
                                className="cursor-pointer bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                            {role.name.charAt(0)}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-2">{role.name}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{role.permissionHint}</p>
                                </div>
                                <div className="h-1.5 w-full bg-gray-50 group-hover:bg-blue-600 transition-colors duration-300"></div>
                            </div>
                        ))}
                    </div>

                    {currentUser.availableRoles.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                            <p className="text-gray-500">No active roles found for your account.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
