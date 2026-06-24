'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { getDashboardRoute } from '@/app/lib/routing';
import { otpService } from '@/app/services/otpService';
import OtpInput from '@/app/components/OtpInput';

export default function SignInPage() {
    const { loginWithCredentials, loginWithOtp, authenticated, activeRole, roles } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
    const [otpSent, setOtpSent] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const startResendTimer = () => {
        setResendTimer(30);
        const timer = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        if (!authenticated) return;

        const savedRedirect = localStorage.getItem('redirect_after_auth');
        if (savedRedirect) {
            localStorage.removeItem('redirect_after_auth');
            router.push(savedRedirect);
            return;
        }

        // All roles use /dashboard — middleware rewrites based on the user_role cookie
        router.push('/dashboard');
    }, [authenticated, activeRole, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!formData.identifier || (loginMethod === 'password' && !formData.password)) {
                throw new Error('Please enter your credentials');
            }

            if (loginMethod === 'password') {
                const result = await loginWithCredentials(formData.identifier, formData.password);
                if (!result.success) setError(result.error || 'Authentication failed');
            } else {
                if (!otpSent) {
                    const result = await otpService.sendOtp(
                        formData.identifier.includes('@') ? undefined : formData.identifier,
                        formData.identifier.includes('@') ? formData.identifier : undefined,
                        true // checkExists
                    );
                    if (result.success) {
                        setOtpSent(true);
                        startResendTimer();
                    } else {
                        setError(result.error || 'Failed to send OTP');
                    }
                } else {
                    const result = await loginWithOtp(
                        otpValue,
                        formData.identifier.includes('@') ? undefined : formData.identifier,
                        formData.identifier.includes('@') ? formData.identifier : undefined
                    );
                    if (!result.success) setError(result.error || 'OTP verification failed');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setIsLoading(true);
        setError('');
        const result = await otpService.sendOtp(
            formData.identifier.includes('@') ? undefined : formData.identifier,
            formData.identifier.includes('@') ? formData.identifier : undefined,
            true // checkExists
        );
        if (result.success) {
            startResendTimer();
        } else {
            setError(result.error || 'Failed to resend OTP');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="flex flex-col items-center">
                        <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                            <span className="font-bold text-2xl text-gray-900">PropertyHub</span>
                        </Link>
                    </div>

                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Access your PropertyHub workspace
                    </p>
                </div>

                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2 mb-8 mt-2">
                    <button
                        onClick={() => { setLoginMethod('password'); setOtpSent(false); setError(''); }}
                        className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all ${loginMethod === 'password' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => { setLoginMethod('otp'); setOtpSent(false); setError(''); }}
                        className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all ${loginMethod === 'otp' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        OTP Login
                    </button>
                </div>

                <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="identifier" className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                                {formData.identifier.includes('@') ? 'Email Address' : 'Phone or Email'}
                            </label>
                            <input
                                id="identifier"
                                name="identifier"
                                type="text"
                                required
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                disabled={otpSent && loginMethod === 'otp'}
                                className="block w-full px-4 py-3.5 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 font-bold"
                                placeholder={loginMethod === 'otp' ? "e.g. +91 9876543210" : "you@propertyhub.com"}
                            />
                            {otpSent && loginMethod === 'otp' && (
                                <button 
                                    type="button"
                                    onClick={() => { setOtpSent(false); setOtpValue(''); }}
                                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 hover:underline ml-1"
                                >
                                    Change Number / Email
                                </button>
                            )}
                        </div>

                        {loginMethod === 'password' ? (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label htmlFor="password" className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="block w-full px-4 py-3.5 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm font-bold"
                                    placeholder="••••••••"
                                />
                                <div className="flex justify-end mt-2">
                                    <Link 
                                        href="/forgot-password" 
                                        className="text-xs font-black text-blue-600 hover:text-blue-500 transition-colors uppercase tracking-wider"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            otpSent && (
                                <div className="space-y-6 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="text-center">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Verification Code</p>
                                        <OtpInput length={4} onComplete={setOtpValue} disabled={isLoading} />
                                    </div>
                                    <div className="text-center">
                                        {resendTimer > 0 ? (
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                Resend in <span className="text-blue-600 font-black">{resendTimer}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                            >
                                                Resend Code
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-sm font-bold border border-rose-100 animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || (loginMethod === 'otp' && otpSent && otpValue.length < 4)}
                        className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            loginMethod === 'password' ? 'Sign In' : (otpSent ? 'Verify & Login' : 'Send Verification Code')
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <span className="text-sm text-gray-500 font-medium">Don't have an account? </span>
                        <Link href="/consultation" className="text-sm font-black text-blue-600 hover:text-blue-500 transition-colors">
                            Get consultation
                        </Link>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        Secure system • PropertyHub v2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
