'use client';

import { useState } from 'react';
import { reviewService } from '@/app/services/reviewService';

export default function ReviewSubmission({ roleName }: { roleName: string }) {
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await reviewService.createReview({
                content,
                rating,
                authorRole: roleName,
            });
            setSuccess(true);
            setContent('');
        } catch (error) {
            alert('Failed to submit review. Please ensure you are logged in.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Share Your Feedback</h1>
            <p className="text-gray-500 mb-8">Your review helps us improve and build trust within the community.</p>

            {success ? (
                <div className="bg-green-50 border border-green-100 p-8 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h2>
                    <p className="text-gray-600 mb-6">Your review has been submitted and is currently under moderation. It will appear on the homepage once approved.</p>
                    <button
                        onClick={() => setSuccess(false)}
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Submit another review
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="mb-8">
                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-4">How would you rate us?</label>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="group relative transition-transform hover:scale-110 active:scale-95 outline-none"
                                >
                                    <svg
                                        className={`w-12 h-12 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Your Experience</label>
                        <textarea
                            required
                            rows={6}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200 text-gray-800"
                            placeholder="What did you like? How can we improve?"
                        />
                    </div>

                    <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        Identifying as: <span className="font-bold text-blue-600 uppercase tracking-wider">{roleName}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-200 disabled:bg-gray-400 disabled:shadow-none"
                    >
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            )}
        </div>
    );
}
