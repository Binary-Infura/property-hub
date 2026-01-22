'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InternalSignIn() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Mock checking of internal users
    const checkCredentials = async (identifier: string, password: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const email = identifier.toLowerCase();

        if (password === 'password') {
            if (email === 'admin@propertyhub.com') {
                return { success: true, role: 'central-authority', redirect: '/central-authority/dashboard' };
            }
            if (email === 'regional@propertyhub.com') {
                return { success: true, role: 'regional-manager', redirect: '/regional-manager/dashboard' };
            }
            if (email === 'consultant@propertyhub.com') {
                return { success: true, role: 'consultant', redirect: '/consultant/dashboard' };
            }
            if (email === 'onboarding@propertyhub.com') {
                return { success: true, role: 'property-onboarding-manager', redirect: '/property-onboarding-manager/dashboard' };
            }
            if (email === 'loan@propertyhub.com') {
                return { success: true, role: 'loan-adviser', redirect: '/loan-adviser/dashboard' };
            }
            if (email === 'marketing@propertyhub.com') {
                return { success: true, role: 'marketing-manager', redirect: '/marketing-manager/dashboard' };
            }
            if (email === 'visit@propertyhub.com') {
                return { success: true, role: 'visit-executive', redirect: '/visit-executive/dashboard' };
            }
            if (email === 'commission@propertyhub.com') {
                return { success: true, role: 'commission-manager', redirect: '/commission-manager/dashboard' };
            }
            if (email === 'channel@propertyhub.com') {
                return { success: true, role: 'channel-partner', redirect: '/channel-partner/dashboard' };
            }

            return { success: false, error: 'Access Denied: You are not an invited internal user.' };
        }

        return { success: false, error: 'Invalid credentials' };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!formData.identifier || !formData.password) {
                throw new Error('Please fill in all fields');
            }

            const result = await checkCredentials(formData.identifier, formData.password);

            if (result.success && result.redirect) {
                router.push(result.redirect);
            } else {
                setError(result.error || 'Authentication failed');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                        PH
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Staff Sign In
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Internal Management Portal
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                                Staff Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="email"
                                    required
                                    value={formData.identifier}
                                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="name@propertyhub.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Access Denied
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-blue-400' : 'bg-slate-800 hover:bg-slate-700'} transition-colors duration-200`}
                        >
                            {isLoading ? 'Authenticating...' : 'Sign in to Workspace'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        This is a secure internal system. unauthorized access is prohibited.
                    </p>
                </div>
            </div>
        </div>
    );
}
