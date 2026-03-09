'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { reviewService, Review } from '../services/reviewService';

export default function DynamicReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await reviewService.getHomepageReviews();
                // Show the latest 3 curated homepage reviews
                setReviews(data.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading) {
        return (
            <section className="py-20 md:py-32 bg-white flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </section>
        );
    }

    if (reviews.length === 0) {
        return null;
    }

    return (
        <section className="py-20 md:py-32 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Hear from Our <span className="text-blue-600 italic">Community</span>
                        </h2>
                        <p className="text-xl text-slate-500 leading-relaxed">
                            Discover stories of success and trust from our diverse network of partners and happy homebuyers.
                        </p>
                    </div>

                    <Link
                        href="/reviews"
                        className="group flex items-center gap-3 text-blue-600 font-black text-lg hover:gap-5 transition-all duration-300"
                    >
                        View All Reviews
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="relative bg-slate-50 p-10 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-2 transition-all duration-500 group"
                        >
                            {/* Quote Decoration */}
                            <div className="absolute top-8 right-10 text-slate-200 group-hover:text-blue-100 transition-colors">
                                <svg className="w-12 h-12 fill-current" viewBox="0 0 512 512">
                                    <path d="M464 256h-80v-64c0-35.3 28.7-64 64-64h16c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16h-16c-88.4 0-160 71.6-160 160v224c0 17.7 14.3 32 32 32h144c17.7 0 32-14.3 32-32V288c0-17.7-14.3-32-32-32zm-256 0h-80v-64c0-35.3 28.7-64 64-64h16c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16h-16C103.6 64 32 135.6 32 224v224c0 17.7 14.3 32 32 32h144c17.7 0 32-14.3 32-32V288c0-17.7-14.3-32-32-32z" />
                                </svg>
                            </div>

                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                ))}
                            </div>

                            <p className="text-slate-700 mb-10 leading-relaxed italic text-lg relative z-10">
                                &quot;{review.content}&quot;
                            </p>

                            <div className="flex items-center gap-4 border-t border-slate-200 pt-8">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
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
            </div>
        </section>
    );
}
