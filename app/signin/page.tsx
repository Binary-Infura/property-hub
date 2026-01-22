'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function BuyerSignIn() {
    const { loginWithCredentials, authenticated, roles } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (authenticated) {
            if (roles.includes('buyer')) {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        }
    }, [authenticated, roles, router]);

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
                // Success will trigger the useEffect above due to 'authenticated' change
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
        <div className="min-h-screen flex items-center justify-center bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div className="text-center">
                    <Link href="/" className="inline-block mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">
                        PH
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to manage your property journey
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
                                placeholder="you@example.com"
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

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
                    >
                        {isLoading ? 'Signing you in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Interested in property? <Link href="/search" className="font-semibold text-blue-600 hover:text-blue-500 underline decoration-2 underline-offset-4">Explore listings</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
