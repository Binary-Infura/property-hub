'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { propertyService, Property } from '@/app/services/propertyService';
import { userService, User } from '@/app/services/userService';
import { marketingService } from '@/app/services/marketingService';
import { reelService, Reel } from '@/app/services/reelService';
import { useConsultingBucket } from '@/app/contexts/ConsultingBucketContext';
import Link from 'next/link';
import ReelCard from '@/app/components/ReelCard';

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const { token, user } = useAuth();
    const { activeContext } = useUnifiedApp();

    const [property, setProperty] = useState<Property | null>(null);
    const [owner, setOwner] = useState<User | null>(null);
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);

    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const handleFollow = async () => {
        if (!token) {
            router.push('/login');
            return;
        }

        if (!owner) return;

        try {
            setFollowLoading(true);
            if (isFollowing) {
                await userService.unfollow(owner.id, token);
                setIsFollowing(false);
            } else {
                await userService.follow(owner.id, token);
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Failed to toggle follow:', error);
        } finally {
            setFollowLoading(false);
        }
    };
    const { addItem, removeItem, isInBucket } = useConsultingBucket();
    const alreadyInBucket = property ? isInBucket(property.id) : false;
    const isBuyer = activeContext.activeRole?.id === 'buyer';

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: property?.name,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handleBucketAction = () => {
        if (!property) return;
        if (alreadyInBucket) {
            removeItem(property.id);
        } else {
            addItem({
                id: property.id,
                title: property.name,
                price: property.price ? `₹${(Number(property.price) / 100000).toFixed(1)}L` : 'Call for Price',
                location: property.location || 'Unknown'
            });
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleInquireSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');
        try {
            await marketingService.submitPublicInquiry({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                projectId: property?.id,
                source: 'Property Page Inquiry',
                assignedTo: owner?.id,
                notes: formData.message || `Inquiry for ${property?.name}`,
            });
            setSubmitSuccess(true);
            setTimeout(() => {
                setIsModalOpen(false);
                setSubmitSuccess(false);
                setFormData({ name: '', email: '', phone: '', message: '' });
            }, 3000);
        } catch (error: any) {
            setSubmitError('Failed to submit your inquiry. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const prop = await propertyService.getOne(id, token || null);
                setProperty(prop);

                if (prop.onboardedById) {
                    const ownerData = await userService.getById(prop.onboardedById, token || null);
                    setOwner(ownerData);
                }

                // Fetch reels for this property
                const reelsData = await reelService.getAll(1, 20, id);
                setReels(reelsData.data);

                // Fetch follow status
                if (token && prop.onboardedById) {
                    const following = await userService.isFollowing(prop.onboardedById, token);
                    setIsFollowing(following);
                }
            } catch (error) {
                console.error('Failed to fetch property details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id, token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em] animate-pulse">Loading Experience...</p>
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 text-center">
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 max-w-lg">
                    <div className="w-24 h-24 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-8">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Property Not Found</h2>
                    <p className="text-slate-500 font-bold mb-10 leading-relaxed text-lg">The listing you are searching for might have been moved or is no longer available.</p>
                    <Link href="/search" className="inline-block px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black tracking-tight hover:scale-105 transition-all shadow-xl shadow-blue-100">Back to Discovery</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFF]">
            {/* Cinematic Header / Navigation */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
                    <button onClick={() => router.back()} className="group flex items-center gap-4 text-slate-900 hover:text-blue-600 transition-all font-black text-sm uppercase tracking-widest">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                        Back to Search
                    </button>
                    <div className="flex gap-4">
                        {isBuyer && (
                            <button
                                onClick={handleBucketAction}
                                className={`w-12 h-12 flex items-center justify-center bg-white border rounded-2xl transition-all shadow-sm ${alreadyInBucket ? 'text-rose-500 border-rose-200 bg-rose-50' : 'text-slate-400 border-slate-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100'}`}
                            >
                                <svg className="w-6 h-6" fill={alreadyInBucket ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={handleShare}
                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left SIDE: Main Content */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Hero Section */}
                        <div className="bg-slate-200 aspect-[16/10] sm:aspect-video rounded-[4rem] overflow-hidden relative shadow-2xl group border-[12px] border-white">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                            <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between">
                                <div className="flex gap-4">
                                    <span className="px-6 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-2xl backdrop-blur-md ring-1 ring-white/20">Verified Elite</span>
                                    {property.status === 'AVAILABLE' && <span className="px-6 py-3 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-2xl backdrop-blur-md ring-1 ring-white/20">Ready to Move</span>}
                                </div>
                                <div className="flex gap-3">
                                    <button className="w-16 h-16 bg-white/20 backdrop-blur-2xl border border-white/30 text-white rounded-3xl flex items-center justify-center hover:bg-white hover:text-blue-600 transition-all duration-500 group">
                                        <svg className="w-7 h-7 group-hover:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                    <button className="w-16 h-16 bg-white/20 backdrop-blur-2xl border border-white/30 text-white rounded-3xl flex items-center justify-center hover:bg-white hover:text-blue-600 transition-all duration-500">
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Property Details Header */}
                        <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-60"></div>

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                                    <div className="flex-1">
                                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-6">{property.name}</h1>
                                        <div className="flex items-center gap-4 text-slate-500 font-bold bg-slate-50 w-fit px-6 py-3 rounded-[1.5rem] border border-slate-100 text-lg">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                            </div>
                                            {property.location}
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-200 text-white min-w-[240px]">
                                        <p className="text-[11px] font-black text-blue-100 uppercase tracking-[0.4em] mb-2">Market Price</p>
                                        <p className="text-5xl font-black">₹{(Number(property.price) / 100000).toFixed(1)}L</p>
                                        <p className="text-[10px] font-bold text-blue-100/60 mt-2 italic">*All Inclusive pricing estimate</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-slate-50 rounded-[3rem] border border-slate-100">
                                    {[
                                        { label: 'Configuration', val: `${property.bedrooms || 2} BHK`, svgIcon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg> },
                                        { label: 'Sanitary', val: `${property.bathrooms || 2} Bath`, svgIcon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg> },
                                        { label: 'Carpet Area', val: `${property.area || 1200} sqft`, svgIcon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg> },
                                        { label: 'Category', val: property.projectType, svgIcon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-all">
                                            <span className="mb-4 text-slate-500 group-hover:scale-125 transition-transform duration-300">{stat.svgIcon}</span>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                            <p className="text-xl font-black text-slate-900">{stat.val}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-16 grid md:grid-cols-5 gap-12">
                                    <div className="md:col-span-3">
                                        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                            <span className="w-2.5 h-10 bg-blue-600 rounded-full"></span>
                                            Property Philosophy
                                        </h3>
                                        <p className="text-2xl text-slate-500 leading-[1.6] font-bold">
                                            {property.description || "Designed for those who appreciate the finer details of urban living. This residence offers an unparalleled sense of space and light, with expansive floor-to-ceiling windows and premium finishes throughout."}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2 bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
                                        <h4 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Key Highlights</h4>
                                        <ul className="space-y-5">
                                            {[
                                                'Vastu Compliant Architecture',
                                                'Premium Italian Flooring',
                                                'High-Efficiency Climate Control',
                                                'Smart Home Automation Ready',
                                                'Panoramic City View Balcony'
                                            ].map((h, i) => (
                                                <li key={i} className="flex items-center gap-4 text-slate-600 font-bold transition-all hover:translate-x-2">
                                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm">{h}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cinematic Amenities */}
                        <div className="bg-[#0F172A] rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>

                            <div className="flex items-end justify-between mb-16 relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black mb-4 flex items-center gap-5">
                                        <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl text-blue-400">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
                                        </div>
                                        Elite Living Amenities
                                    </h3>
                                    <p className="text-slate-400 font-bold text-lg ml-20">Everything you need for a frictionless lifestyle.</p>
                                </div>
                                <div className="hidden sm:block text-right">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em]">Verified Infrastructure</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                                {[
                                    { name: 'Sanctuary Spa', val: 'Ayurvedic Wellness', svgIcon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg> },
                                    { name: 'Crystal Pool', val: 'Olympic standard', svgIcon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg> },
                                    { name: 'Arctic Flow', val: 'RO Centralized', svgIcon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /></svg> },
                                    { name: 'Bio Guardian', val: '24/7 AI Security', svgIcon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg> },
                                    { name: 'Eden Gardens', val: 'Bonsai Collection', svgIcon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg> },
                                    { name: 'Play Horizon', val: 'Interactive Zone', svgIcon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg> }
                                ].map((item, i) => (
                                    <div key={i} className="group p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors text-slate-300">
                                            {item.svgIcon}
                                        </div>
                                        <p className="text-base font-black text-white mb-2">{item.name}</p>
                                        <p className="text-xs font-bold text-slate-500 group-hover:text-blue-300 transition-colors uppercase tracking-widest">{item.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Property Reels Section */}
                        {reels.length > 0 && (
                            <div className="bg-[#0F172A] rounded-[4rem] p-12 md:p-16 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

                                <div className="flex items-end justify-between mb-12 relative z-10">
                                    <div>
                                        <h3 className="text-3xl font-black mb-3 flex items-center gap-5">
                                            <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl text-violet-400">
                                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            Property Reels
                                        </h3>
                                        <p className="text-slate-400 font-bold text-lg ml-20">{reels.length} walkthrough{reels.length !== 1 ? 's' : ''} by the partner</p>
                                    </div>
                                    <Link
                                        href="/reels"
                                        className="hidden sm:flex items-center gap-2 text-[11px] font-black text-violet-400 uppercase tracking-[0.4em] hover:text-white transition-colors"
                                    >
                                        View All Reels
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10 w-full">
                                    {reels.map((reel) => (
                                        <ReelCard key={reel.id} reel={reel} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right SIDE: Partner Business Profile */}
                <div className="lg:col-span-4 space-y-12">
                    {/* Premium Partner Card */}
                    <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 sticky top-32 group overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 group-hover:w-4 transition-all duration-500"></div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 text-center">Exclusive Listing By</p>

                        <div className="flex flex-col items-center text-center mb-12">
                            <div className="relative mb-8">
                                <div className="w-36 h-36 rounded-[3rem] bg-indigo-600 flex items-center justify-center font-black text-4xl text-white shadow-2xl shadow-indigo-100 ring-[12px] ring-indigo-50 group-hover:scale-105 transition-transform duration-500">
                                    {(owner?.firstName || 'P').charAt(0)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-emerald-500 border-[6px] border-white rounded-full flex items-center justify-center shadow-2xl">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 leading-none italic">{owner?.firstName} {owner?.lastName}</h4>
                            <div className="px-5 py-2 bg-indigo-50 rounded-full border border-indigo-100 mb-8">
                                <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest">
                                    {owner?.propertyPartnerProfile?.companyName || 'Elite Property Solutions'}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                                <span className="text-[11px] font-black text-slate-400 ml-2 uppercase tracking-widest">Trust Index 5.0</span>
                            </div>
                        </div>

                        <div className="space-y-5 mb-12">
                            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 group/item hover:bg-white hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-md group-hover/item:scale-110 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Line</p>
                                    <p className="text-slate-900 font-extrabold text-lg tracking-tight">{owner?.phone || '+91 98765 43210'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 group/item hover:bg-white hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-md group-hover/item:scale-110 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Corporate Email</p>
                                    <p className="text-slate-900 font-extrabold text-sm truncate tracking-tight">{owner?.email || 'sales@partner.com'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button onClick={() => setIsModalOpen(true)} className="w-full py-7 bg-indigo-600 text-white rounded-[2rem] font-black text-lg tracking-tight hover:scale-[1.02] hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-indigo-200">
                                Inquire Now
                            </button>
                            <Link href={`/partner/${owner?.id}`} className="w-full py-7 bg-slate-900 text-white rounded-[2rem] font-black text-lg tracking-tight hover:scale-[1.02] hover:bg-black active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4">
                                Business Profile
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                            {owner && (!token || (user?.userId !== owner.id && activeContext.activeRole.id === 'buyer')) && (
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={`w-full py-5 rounded-[2rem] font-black text-lg tracking-tight hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 border shadow-sm ${isFollowing
                                        ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                        }`}>
                                    {followLoading ? (
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            {isFollowing ? (
                                                <>
                                                    <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Following
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Follow Partner
                                                </>
                                            )}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em]">RERA REG: {owner?.reraId || 'PR77334455'}</p>
                        </div>
                    </div>


                </div>
            </main>

            {/* Inquire Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[3rem] w-full max-w-lg p-8 md:p-12 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {submitSuccess ? (
                            <div className="text-center py-10">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Request Sent Successfully!</h3>
                                <p className="text-slate-500 font-bold">The partner will contact you shortly.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Express Interest</h3>
                                <p className="text-slate-500 font-bold mb-8">Connect with the partner for more details.</p>

                                {submitError && (
                                    <div className="mb-6 p-4 bg-rose-50 text-rose-600 font-bold rounded-2xl flex items-center gap-3">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {submitError}
                                    </div>
                                )}

                                <form onSubmit={handleInquireSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-4">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 text-slate-900 px-6 py-4 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-4">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 text-slate-900 px-6 py-4 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-4">Email Address (Optional)</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 text-slate-900 px-6 py-4 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-4">Message (Optional)</label>
                                        <textarea
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 text-slate-900 px-6 py-4 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all resize-none h-24"
                                            placeholder="I would like to know more about this property..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-4 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg tracking-tight shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Submitting...
                                            </>
                                        ) : 'Send Inquiry'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
