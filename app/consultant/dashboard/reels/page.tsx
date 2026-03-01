"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { reelService } from '@/app/services/reelService';
import ReelCard from '@/app/components/ReelCard';

export default function ConsultantReelsPage() {
    const { token } = useAuth();
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReels() {
            if (!token) return;
            try {
                // Fetch all reels
                const response = await reelService.getAll();
                setReels(response.data);
            } catch (error) {
                console.error('Error fetching reels:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchReels();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Property Reels</h1>
                    <p className="text-gray-600 mt-1">Watch and share property walkthroughs</p>
                </div>

                {reels.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">No reels found</h3>
                        <p className="mt-1 text-gray-500">There are no property reels available at this time.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {reels.map((reel) => (
                            <ReelCard key={reel.id} reel={reel} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
