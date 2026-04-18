'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import SidebarIcon from '@/app/components/SidebarIcon';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export default function WalletPage({ isConsultant = false }: { isConsultant?: boolean }) {
    const { token, user } = useAuth();
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecharging, setIsRecharging] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(1000);
    const [customAmount, setCustomAmount] = useState<string>('');

    const fetchWalletData = useCallback(async () => {
        if (!token) return;
        try {
            setIsLoading(true);
            const [balanceRes, transactionsRes] = await Promise.all([
                fetch(`${API_URL}/api/payments/wallet/balance`, {
                    method: 'POST', // Backend currently uses POST for balance
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/payments/wallet/transactions`, {
                    method: 'POST', // Backend currently uses POST for transactions
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (balanceRes.ok) {
                const balanceData = await balanceRes.json();
                setBalance(Number(balanceData.balance));
            }

            if (transactionsRes.ok) {
                const transData = await transactionsRes.json();
                setTransactions(transData);
            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchWalletData();
    }, [fetchWalletData]);

    const handleRecharge = async () => {
        const finalAmount = selectedAmount === 'custom' ? Number(customAmount) : selectedAmount;

        if (!finalAmount || finalAmount < 100) {
            toast.error('Minimum recharge amount is ₹100');
            return;
        }

        try {
            setIsRecharging(true);
            const res = await loadRazorpayScript();

            if (!res) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // Create Order
            const orderResponse = await fetch(`${API_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: finalAmount }),
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }

            const orderData = await orderResponse.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RENvNtOLr6vA5o',
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'PropertyHub Wallet',
                description: 'Wallet Recharge',
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
                            toast.success(`Successfully recharged ₹${finalAmount}!`);
                            fetchWalletData();
                            setIsRecharging(false);
                        } else {
                            toast.error('Payment verification failed.');
                            setIsRecharging(false);
                        }
                    } catch (err) {
                        toast.error('Something went wrong during verification.');
                        setIsRecharging(false);
                    }
                },
                prefill: {
                    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Partner',
                    email: user?.email || '',
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
            setIsRecharging(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {isConsultant ? 'Available Recharge' : 'Your Wallet'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isConsultant 
                            ? 'View your current balance for calls and platform services' 
                            : 'Manage your balance for calls and platform services'}
                    </p>
                </div>
                <Link 
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <SidebarIcon name="chevron-left" className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>

            <div className={`grid ${isConsultant ? '' : 'lg:grid-cols-3'} gap-8`}>
                {/* Balance Card & Recharge Form */}
                <div className={`${isConsultant ? 'max-w-3xl mx-auto w-full' : 'lg:col-span-2'} space-y-6`}>
                    {/* Balance Display */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-32 -mt-32 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -ml-24 -mb-24"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-blue-300 mb-2">
                                <SidebarIcon name="money" className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-widest opacity-80">Available Balance</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tracking-tighter">
                                    ₹{balance !== null ? balance.toLocaleString('en-IN') : '...'}
                                </span>
                                <span className="text-blue-300 font-medium">INR</span>
                            </div>
                            
                            <div className="mt-8 flex items-center gap-4">
                                <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Wallet Active</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recharge Form - Partner Only */}
                    {!isConsultant && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
                        >
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <SidebarIcon name="star" className="w-5 h-5 text-blue-600" />
                                Add Credits
                            </h2>
                            
                            <div className="space-y-8">
                                {/* Preset Selection */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {PRESET_AMOUNTS.map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => {
                                                setSelectedAmount(amount);
                                                setCustomAmount('');
                                            }}
                                            className={`py-4 px-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1 group
                                                ${selectedAmount === amount 
                                                    ? 'bg-blue-50 border-blue-600 shadow-lg shadow-blue-100' 
                                                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span className={`text-xs font-black uppercase tracking-wider ${selectedAmount === amount ? 'text-blue-600' : 'text-slate-400'}`}>Amount</span>
                                            <span className={`text-xl font-black ${selectedAmount === amount ? 'text-blue-700' : 'text-slate-900'}`}>₹{amount}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Amount */}
                                <div className="space-y-4">
                                    <button
                                        onClick={() => setSelectedAmount('custom')}
                                        className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group
                                            ${selectedAmount === 'custom' 
                                                ? 'bg-blue-50 border-blue-600' 
                                                : 'bg-white border-slate-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedAmount === 'custom' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                <SidebarIcon name="note" className="w-5 h-5" />
                                            </div>
                                            <span className={`font-bold ${selectedAmount === 'custom' ? 'text-blue-700' : 'text-slate-600'}`}>Custom Amount</span>
                                        </div>
                                        <SidebarIcon name="chevron-right" className={`w-4 h-4 transition-transform ${selectedAmount === 'custom' ? 'text-blue-600 rotate-90' : 'text-slate-300'}`} />
                                    </button>

                                    <AnimatePresence>
                                        {selectedAmount === 'custom' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="relative mt-2">
                                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                                        <span className="text-xl font-black text-slate-400">₹</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={customAmount}
                                                        onChange={(e) => setCustomAmount(e.target.value)}
                                                        placeholder="Enter custom amount"
                                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-600 focus:ring-0 transition-all font-black text-xl text-slate-900 outline-none"
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-400 mt-2 px-1">Minimum recharge of ₹100 required</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Summary & Action */}
                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Recharge</p>
                                            <p className="text-3xl font-black text-slate-900">
                                                ₹{selectedAmount === 'custom' ? (customAmount || '0') : selectedAmount}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fee</p>
                                            <p className="text-sm font-bold text-green-600">₹0.00 (Inclusive)</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleRecharge}
                                        disabled={isRecharging || (selectedAmount === 'custom' && (!customAmount || Number(customAmount) < 100))}
                                        className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg group active:scale-[0.98]"
                                    >
                                        {isRecharging ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                <SidebarIcon name="star" className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                                Recharge Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Recent Transactions - Hidden for consultants if requested */}
                {!isConsultant && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-900">Recent Activity</h2>
                            <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 tracking-wider">LAST 20</span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                            {isLoading ? (
                                <div className="space-y-4 p-4">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className="animate-pulse flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                                <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-20 px-8 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <SidebarIcon name="clipboard" className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-700">No transactions yet</h3>
                                    <p className="text-xs text-slate-400 mt-1">Recharge your wallet to see your activity here.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {transactions.map((tx) => (
                                        <div 
                                            key={tx.id}
                                            className="p-4 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-4 group"
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 
                                                ${tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                                            >
                                                <SidebarIcon name={tx.amount > 0 ? "plus" : "minus"} className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {tx.description || tx.type}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium">
                                                    {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <p className={`text-sm font-black whitespace-nowrap ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                                                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                            <button className="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors tracking-widest uppercase">
                                View Detailed Statement
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Help Section - Partner Only */}
            {!isConsultant && (
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { title: 'Call Usage', desc: `Credits are deducted automatically for calls based on duration (₹2 per minute).`, icon: 'phone' },
                        { title: 'Secure Payments', desc: 'All transactions are encrypted and processed securely via Razorpay.', icon: 'lock' },
                        { title: 'Automatic Invoicing', desc: 'Get GST receipts for every recharge sent to your registered email.', icon: 'clipboard' }
                    ].map((item, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                <SidebarIcon name={item.icon as any} className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 mb-1">{item.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
