'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { getDashboardRoute } from '@/app/lib/routing';

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

            // Check for explicit redirect request
            const savedRedirect = localStorage.getItem('redirect_after_auth');
            if (savedRedirect) {
                localStorage.removeItem('redirect_after_auth');
                router.push(savedRedirect);
                return;
            }

            // 0. Use primaryRole if available
            const primaryRole = user.primaryRole;
            if (primaryRole && roles.includes(primaryRole)) {
                router.push(getDashboardRoute(primaryRole));
                return;
            }

            // 1. If single role, go there
            if (roles.length === 1) {
                router.push(getDashboardRoute(roles[0]));
                return;
            }

            // 2. If multiple roles without a primaryRole, let them choose
            if (roles.length > 1) {
                router.push('/my-dashboards');
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
                    <div className="flex flex-col items-center">
                        <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                            <span className="font-bold text-2xl text-gray-900">PropertyHub</span>
                        </Link>
                    </div>

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

                    <div className="text-center pt-2">
                        <span className="text-sm text-gray-600">Don't have an account? </span>
                        <Link href="/consultation" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                            Get a Free Consultation & Sign Up
                        </Link>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        Secure system. Authorized access only.
                    </p>
                </div>
            </div>
        </div>
    );
}
