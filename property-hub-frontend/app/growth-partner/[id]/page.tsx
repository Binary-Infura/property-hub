'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { growthPartnerService } from '@/app/services/growthPartnerService';
import { useAuth } from '@/app/contexts/AuthContext';
import CollaborationRequestModal from '@/app/components/growth-marketplace/CollaborationRequestModal';
import { toast } from 'react-hot-toast';

export default function GrowthPartnerProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { token } = useAuth();
    const [partner, setPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    useEffect(() => {
        if (token && id) {
            fetchProfile();
        }
    }, [token, id]);

    const fetchProfile = async () => {
        try {
            const data = await growthPartnerService.getProfile(token as string, id);
            setPartner(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!partner) return <div className="p-20 text-center font-bold text-gray-500">Partner not found</div>;

    const profileData = partner.profileData || {};

    return (
        <div className="min-h-screen bg-[#FAFAFB]">
            {/* Cover and Profile Header */}
            <div className="h-64 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 relative shadow-inner overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                   <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_70%)]" />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Basic Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 text-center border border-gray-100"
                        >
                            <div className="w-32 h-32 bg-gray-50 ring-8 ring-white rounded-[2rem] mx-auto -mt-20 flex items-center justify-center text-4xl font-extrabold text-blue-600 shadow-xl overflow-hidden mb-6">
                                {(partner.firstName[0] + (partner.lastName?.[0] || '')).toUpperCase()}
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 mb-2">{partner.firstName} {partner.lastName}</h1>
                            <div className="flex justify-center gap-2 mb-6">
                                <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-md shadow-blue-200">
                                    {profileData.type || 'Growth Partner'}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-6 border-y border-gray-50">
                                <div>
                                    <p className="text-xl font-black text-gray-900">{profileData.rating || '4.9'}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</p>
                                </div>
                                <div>
                                    <p className="text-xl font-black text-gray-900">{profileData.followers || '100k+'}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reach</p>
                                </div>
                                <div>
                                    <p className="text-xl font-black text-gray-900">{profileData.reviews?.length || 0}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reviews</p>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <button
                                    onClick={() => setIsRequestModalOpen(true)}
                                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-wider text-base"
                                >
                                    REQUEST COLLABORATION
                                </button>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Verified by Property Hub Marketplace</p>
                            </div>
                        </motion.div>

                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] shadow-xl text-white overflow-hidden relative group">
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-lg font-black uppercase tracking-widest mb-6 opacity-80">Platforms</h3>
                            <div className="flex flex-wrap gap-2">
                                {(profileData.platforms || []).map((p: string) => (
                                    <span key={p} className="px-4 py-2 bg-white/10 backdrop-blur-md text-sm font-bold rounded-xl border border-white/10 hover:bg-blue-600/20 transition-all cursor-default">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bio, Portfolio, Reviews */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100"
                        >
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-blue-600 rounded-full" />
                                Professional Bio
                            </h2>
                            <p className="text-gray-600 leading-relaxed text-lg font-medium whitespace-pre-wrap">
                                {profileData.bio || 'This growth partner has not provided a bio yet, but their work history and ratings speak for themselves. Specialized in real estate marketing and high-conversion lead generation strategies.'}
                            </p>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                        >
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                                    Portfolio
                                </div>
                                <span className="text-sm font-bold text-gray-400">{(profileData.portfolio || []).length} Items</span>
                            </h2>
                            
                            {(profileData.portfolio || []).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {profileData.portfolio.map((item: any, idx: number) => (
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" key={idx} className="group relative aspect-video bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 hover:border-indigo-200 transition-all">
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <p className="text-white font-black text-lg line-clamp-1">{item.title}</p>
                                                <p className="text-white/60 text-xs font-bold uppercase mt-1">View Project →</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 font-bold">No portfolio projects uploaded yet.</p>
                                </div>
                            )}
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100"
                        >
                            <h2 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-purple-600 rounded-full" />
                                Client Feedback
                            </h2>
                            
                            <div className="space-y-8">
                                {(profileData.reviews || []).length > 0 ? (
                                    profileData.reviews.map((review: any, idx: number) => (
                                        <div key={idx} className="flex gap-6 p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-lg transition-all">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-gray-400 shadow-sm">
                                                {review.author[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-black text-gray-900">{review.author}</h4>
                                                    <div className="flex text-amber-400">
                                                        {[...Array(review.rating)].map((_, i) => (
                                                            <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-500 font-medium leading-relaxed italic">&quot;{review.comment}&quot;</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-center font-bold py-10">No reviews yet. Be the first to work with them!</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {partner && (
                <CollaborationRequestModal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    partner={{
                        id: partner.id,
                        name: `${partner.firstName} ${partner.lastName || ''}`,
                        type: profileData.type,
                        platforms: profileData.platforms || []
                    }}
                    token={token as string}
                />
            )}
        </div>
    );
}
