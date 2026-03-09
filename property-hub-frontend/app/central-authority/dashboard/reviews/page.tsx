'use client';

import { useState, useEffect } from 'react';
import { reviewService, Review } from '@/app/services/reviewService';

export default function ReviewApprovalPage() {
    const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
    const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

    // Global setting simulation (can be moved to a dedicated settings API later)
    const [showViewAll, setShowViewAll] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [pending, approved] = await Promise.all([
                reviewService.getPendingReviews(),
                reviewService.getApprovedReviews()
            ]);
            setPendingReviews(pending);
            setApprovedReviews(approved);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
        try {
            const updated = await reviewService.toggleVisibility(id);
            if (activeTab === 'pending') {
                setPendingReviews(prev => prev.filter(r => r.id !== id));
                setApprovedReviews(prev => [updated, ...prev]);
            } else {
                setApprovedReviews(prev => prev.map(r => r.id === id ? updated : r));
            }
        } catch (error) {
            alert('Failed to update visibility');
        }
    };

    const handleToggleHomepage = async (id: string) => {
        try {
            const updated = await reviewService.toggleHomepageVisibility(id);
            if (activeTab === 'approved') {
                setApprovedReviews(prev => prev.map(r => r.id === id ? updated : r));
            } else {
                setPendingReviews(prev => prev.map(r => r.id === id ? updated : r));
            }
        } catch (error) {
            alert('Failed to update homepage status');
        }
    };

    const currentReviews = activeTab === 'pending' ? pendingReviews : approvedReviews;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Review Governance</h1>
                    <p className="text-gray-500 mt-1">Control review visibility and homepage curation.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                        <span className="text-sm font-bold text-slate-600 italic">"View All" Button</span>
                        <button
                            onClick={() => setShowViewAll(!showViewAll)}
                            className={`w-12 h-6 rounded-full transition-all relative ${showViewAll ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showViewAll ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'pending'
                                    ? 'bg-white text-blue-600 shadow-lg shadow-blue-100'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Hidden ({pendingReviews.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('approved')}
                            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'approved'
                                    ? 'bg-white text-blue-600 shadow-lg shadow-blue-100'
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Visible ({approvedReviews.length})
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : currentReviews.length === 0 ? (
                <div className="bg-white p-20 text-center rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">No reviews found</h2>
                    <p className="text-gray-500 max-w-xs mx-auto">All reviews for this category have been processed or none exist.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {currentReviews.map((review) => (
                        <div key={review.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-blue-100 transition-all duration-300 group">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                            {review.authorRole}
                                        </span>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-gray-800 text-xl font-medium leading-relaxed mb-8 italic text-slate-700">
                                        &quot;{review.content}&quot;
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 text-sm border border-slate-100">
                                            {review.authorName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-gray-900">{review.authorName}</p>
                                            <p className="text-xs text-slate-400 font-bold">{new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 w-full md:w-64">
                                    <button
                                        onClick={() => handleToggleVisibility(review.id, review.isApproved)}
                                        className={`w-full py-4 rounded-2xl font-black text-sm transition-all border shadow-sm flex items-center justify-center gap-3 ${review.isApproved
                                                ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                : 'bg-green-600 text-white border-green-700 hover:bg-green-700 shadow-green-100'
                                            }`}
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.523 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                        {review.isApproved ? 'Hide Review' : 'Show Review'}
                                    </button>

                                    <button
                                        onClick={() => handleToggleHomepage(review.id)}
                                        disabled={!review.isApproved}
                                        className={`w-full py-4 rounded-2xl font-black text-sm transition-all border flex items-center justify-center gap-3 ${!review.isApproved
                                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                                : review.showOnHomepage
                                                    ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                                                    : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <svg className={`w-5 h-5 ${review.showOnHomepage ? 'fill-current' : 'stroke-current fill-none'}`} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        {review.showOnHomepage ? 'On Homepage' : 'Add to Home'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
