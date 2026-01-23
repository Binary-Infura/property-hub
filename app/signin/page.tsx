'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function SignInPage() {
    const { loginWithCredentials, authenticated, user, roles } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (authenticated && user) {
            console.log('User roles for redirection:', roles);

            // 1. Central Authority
            if (roles.includes('central-authority')) {
                router.push('/central-authority/dashboard');
                return;
            }

            // 2. Internal Staff Roles
            const internalRoles = [
                'regional-manager',
                'consultant',
                'property-onboarding-manager',
                'loan-adviser',
                'marketing-manager',
                'visit-executive',
                'commission-manager',
                'channel-partner'
            ];

            const foundInternalRole = internalRoles.find(role => roles.includes(role));
            if (foundInternalRole) {
                router.push(`/${foundInternalRole}/dashboard`);
                return;
            }

            // 3. Consumer/Other Roles
            if (roles.includes('buyer')) {
                router.push('/dashboard');
                return;
            }

            // Fallback
            router.push('/');
        }
    }, [authenticated, user, roles, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!formData.identifier || !formData.password) {
                throw new Error('Please enter your credentials');
            }

            const result = await loginWithCredentials(formData.identifier, formData.password);

            if (result.success) {
                console.log('Login successful');
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <Link href="/" className="inline-block mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">
                        PH
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Sign In
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Access your PropertyHub workspace
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="identifier"
                                name="identifier"
                                type="email"
                                required
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
                                placeholder="you@propertyhub.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-lg transition-all active:scale-[0.98]"
                    >
                        {isLoading ? 'Signing you in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        Secure internal system. Authorized access only.
                    </p>
                </div>
            </div>
        </div>
    );
}
