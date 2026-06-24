'use client';

import { useState, useEffect } from 'react';
import { reviewService, Review } from '@/app/services/reviewService';
import Link from 'next/link';

export default function AllReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await reviewService.getApprovedReviews();
                setReviews(data);
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Minimal Header */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                            P
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">BuilderBus</span>
                    </Link>
                    <Link href="/" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </nav>

            <main className="py-20 md:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                            Community <span className="text-blue-600">Voices</span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Discover honest feedback and success stories from our network of property partners and homebuyers.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-gray-100">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">No reviews yet</h2>
                            <p className="text-slate-500">Be the first to share your experience with the community.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group">
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`w-5 h-5 transition-colors duration-300 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-slate-700 mb-8 leading-relaxed italic text-lg">&quot;{review.content}&quot;</p>
                                    <div className="flex items-center gap-4 mt-auto">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">
                                            {review.authorName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-none mb-1">{review.authorName}</p>
                                            <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">{review.authorRole}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer CTA */}
            <section className="bg-blue-600 py-20 mt-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-black text-white mb-6">Want to share your experience?</h2>
                    <p className="text-blue-100 mb-10 text-lg">Log in to your dashboard to submit a review and help the community grow.</p>
                    <Link href="/signin" className="inline-block bg-white text-blue-600 px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-800/20 hover:scale-105 active:scale-95 transition-all">
                        Get Started
                    </Link>
                </div>
            </section>
        </div>
    );
}
