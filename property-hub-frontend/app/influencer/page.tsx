'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function InfluencerDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalReach: 0,
        activeCampaigns: 0,
        totalLeads: 0,
        earnings: 0,
    });

    useEffect(() => {
        // Mock stats for now
        setStats({
            totalReach: 150000,
            activeCampaigns: 2,
            totalLeads: 45,
            earnings: 12500,
        });
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName || 'Influencer'}!</h1>
                <p className="text-gray-600 mt-2">Here's your marketing impact and performance summary.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Reach</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalReach.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">+5.2% this month</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Active Campaigns</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeCampaigns}</p>
                    <p className="text-xs text-blue-600 mt-1">Ongoing promotions</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Leads Generated</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalLeads}</p>
                    <p className="text-xs text-purple-600 mt-1">High intent prospects</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">₹{stats.earnings.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">Confirmed payouts</p>
                </div>
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Active Campaigns</h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium font-bold uppercase transition-all">
                        View All
                    </button>
                </div>
                <div className="p-8 text-center text-gray-500 italic">
                    <div className="mb-4">
                        <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                    </div>
                    No active campaigns at the moment.
                </div>
            </div>

            {/* Performance Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg shadow-blue-200">
                    <h2 className="text-xl font-bold mb-3">Improve Your Reach</h2>
                    <p className="text-blue-50 opacity-90 text-sm mb-6">
                        Check out our latest real estate market insights to create more engaging content for your audience.
                    </p>
                    <button className="px-6 py-2 bg-white text-blue-600 font-bold rounded-lg text-sm hover:bg-blue-50 transition-all uppercase tracking-tight">
                        Explore Insights
                    </button>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Community Resources</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Access high-quality media kits, property videos, and promotional posters to use in your marketing.
                    </p>
                    <button className="px-6 py-2 border border-gray-200 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-50 transition-all uppercase tracking-tight">
                        Media Kit
                    </button>
                </div>
            </div>
        </div>
    );
}
