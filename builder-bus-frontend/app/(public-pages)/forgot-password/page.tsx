'use client';

import { useState } from 'react';
import Link from 'next/link';
import { otpService } from '@/app/services/otpService';
import OtpInput from '@/app/components/OtpInput';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState('');
    const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
    const [otpValue, setOtpValue] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await otpService.sendOtp(
                identifier.includes('@') ? undefined : identifier,
                identifier.includes('@') ? identifier : undefined,
                true // checkExists - only send OTP if user exists
            );

            if (result.success) {
                setStep('verify');
            } else {
                setError(result.error || 'Failed to send OTP. Please check your credentials.');
            }
        } catch (err: any) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError('');
        setIsLoading(true);

        try {
            const result = await otpService.verifyOtp(
                otpValue,
                identifier.includes('@') ? undefined : identifier,
                identifier.includes('@') ? identifier : undefined,
                false // consume: false
            );

            if (result.success) {
                setStep('reset');
            } else {
                setError(result.error || 'Invalid or expired OTP');
            }
        } catch (err: any) {
            setError('Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/reset-password`, {
                phone: identifier.includes('@') ? undefined : identifier,
                email: identifier.includes('@') ? identifier : undefined,
                code: otpValue,
                newPassword: newPassword,
            });

            if (response.data.success) {
                setSuccess(true);
            } else {
                setError(response.data.message || 'Failed to reset password');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Password reset failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Password Reset Successful</h2>
                        <p className="text-gray-500 font-medium mb-8">
                            Your password has been successfully updated. You can now sign in with your new password.
                        </p>
                        <Link
                            href="/signin"
                            className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-slate-900 hover:bg-slate-800 shadow-xl transition-all"
                        >
                            Go to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="flex flex-col items-center">
                        <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                            <span className="font-bold text-2xl text-gray-900">BuilderBus</span>
                        </Link>
                    </div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        {step === 'request' && 'Forgot Password'}
                        {step === 'verify' && 'Verify Identity'}
                        {step === 'reset' && 'Create New Password'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        {step === 'request' && 'Enter your email or phone to receive a reset code'}
                        {step === 'verify' && `We've sent a code to ${identifier}`}
                        {step === 'reset' && 'Set a strong password for your account'}
                    </p>
                </div>

                {step === 'request' && (
                    <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
                        <div>
                            <label htmlFor="identifier" className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                                Phone or Email
                            </label>
                            <input
                                id="identifier"
                                type="text"
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="block w-full px-4 py-3.5 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm font-bold"
                                placeholder="you@propertyhub.com"
                            />
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-sm font-bold border border-rose-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-slate-900 hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                        
                        <div className="text-center">
                            <Link href="/signin" className="text-xs font-black text-blue-600 hover:text-blue-500 uppercase tracking-wider">
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}

                {step === 'verify' && (
                    <div className="mt-8 space-y-8">
                        <div className="text-center">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Verification Code</p>
                            <OtpInput length={4} onComplete={setOtpValue} disabled={isLoading} />
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-sm font-bold border border-rose-100">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleVerifyOtp}
                            disabled={isLoading || otpValue.length < 4}
                            className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-slate-900 hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>

                        <button
                            onClick={() => setStep('request')}
                            className="w-full text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-wider"
                        >
                            Change Email / Phone
                        </button>
                    </div>
                )}

                {step === 'reset' && (
                    <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="new-password" className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                                    New Password
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full px-4 py-3.5 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full px-4 py-3.5 border border-gray-200 rounded-2xl shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm font-bold"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-sm font-bold border border-rose-100">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-slate-900 hover:bg-slate-800 shadow-xl transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center border-t border-slate-50 pt-8">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        Secure system • BuilderBus v2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
