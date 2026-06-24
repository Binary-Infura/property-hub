'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import SidebarIcon from '@/app/components/SidebarIcon';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function SubscriptionPage() {
    const { token, profileStatus } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    // Default to false if profileStatus hasn't loaded fully
    const isPremium = profileStatus?.['PROPERTY_PARTNER']?.profileData?.isPremium || false;

    const handleSubscribe = async () => {
        try {
            setIsLoading(true);
            const res = await loadRazorpayScript();

            if (!res) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                setIsLoading(false);
                return;
            }

            // Create Order
            const orderResponse = await fetch(`${API_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: 1000 }), // 1000 INR
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }

            const orderData = await orderResponse.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RENvNtOLr6vA5o',
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'BuilderBus Premium',
                description: 'Upgrade to Property Partner Premium',
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch(`${API_URL}/api/payments/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            }),
                        });

                        if (verifyRes.ok) {
                            toast.success('Payment successful! You are now a Premium Partner.');
                            // Trigger full page reload to refresh auth context and user profile
                            setTimeout(() => {
                                window.location.href = '/dashboard';
                            }, 1500);
                        } else {
                            toast.error('Payment verification failed.');
                        }
                    } catch (err) {
                        toast.error('Something went wrong during verification.');
                    }
                },
                prefill: {
                    name: profileStatus?.['PROPERTY_PARTNER']?.profileData?.name || 'Property Partner',
                    email: '', // Could pull from auth context
                    contact: '',
                },
                theme: {
                    color: '#2563EB',
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
                            <p className="text-gray-600 mt-1">Manage your plan and billing details</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {isPremium ? (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                        
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-semibold mb-6 border border-white/20 backdrop-blur-md">
                                    <SidebarIcon name="star" className="w-4 h-4" />
                                    Premium Active
                                </div>
                                <h2 className="text-3xl font-bold mb-2">You are on the Premium Plan!</h2>
                                <p className="text-blue-100 max-w-lg mb-8 text-lg">
                                    Enjoy full access to advanced tools, team management, detailed analytics, API access, and priority partner support.
                                </p>
                                
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {['Unlimited Team Members', 'Priority Partner Support', 'Custom Lead Reports', 'API Access Integration'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-blue-50">
                                            <div className="w-5 h-5 rounded-full bg-blue-400/30 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md">
                                    <SidebarIcon name="star" className="w-16 h-16 text-yellow-300 drop-shadow-md" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Current Plan */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col h-full">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold mb-6 w-max">
                                Current Plan
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Basic Plan</h2>
                            <p className="text-gray-500 mb-8 flex-1">
                                Essential tools for getting started with property management.
                            </p>
                            <div className="space-y-4 mb-8 text-gray-600">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Up to 3 Projects
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Basic Analytics
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Standard Support
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mt-auto">Free</div>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-[#2563EB] rounded-2xl p-8 shadow-xl text-white flex flex-col h-full relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -mr-20 -mt-20"></div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-yellow-900 text-sm font-bold w-max shadow-sm">
                                        <SidebarIcon name="star" className="w-4 h-4" /> Recommended
                                    </div>
                                </div>
                                
                                <h2 className="text-3xl font-bold mb-2">Premium Plan</h2>
                                <p className="text-blue-100 mb-8 flex-1 text-lg">
                                    Unlock powerful tools to scale your real estate business.
                                </p>
                                
                                <div className="space-y-4 mb-8">
                                    {[
                                        'Advanced Portfolio Analytics',
                                        'Unlimited Team Members',
                                        'Priority Partner Support',
                                        'Custom Lead Reports',
                                        'API Access Integration'
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-white font-medium">
                                            <div className="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold">₹1000</span>
                                        <span className="text-blue-200 ml-2">/ month</span>
                                    </div>
                                    <button 
                                        onClick={handleSubscribe} 
                                        disabled={isLoading}
                                        className="w-full py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                                    >
                                        {isLoading ? 'Processing...' : 'Upgrade Now'}
                                        {!isLoading && (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
