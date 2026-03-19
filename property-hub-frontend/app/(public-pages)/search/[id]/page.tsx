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
import dynamic from 'next/dynamic';

const UnitExplorer3D = dynamic(() => import('@/app/components/UnitExplorer3D'), { ssr: false });

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const { token, user } = useAuth();
    const { activeContext } = useUnifiedApp();

    const [property, setProperty] = useState<Property | null>(null);
    const [owner, setOwner] = useState<User | null>(null);
    const [reels, setReels] = useState<Reel[]>([]);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [states, setStates] = useState<{ code: string; name: string }[]>([]);

    const stateMap = states.reduce((acc, s) => {
        acc[s.code] = s.name;
        return acc;
    }, {} as Record<string, string>);

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
    const isBuyer = activeContext.activeRole?.id === 'BUYER';

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
        const fetchStates = async () => {
            try {
                const data = await propertyService.getStates();
                setStates(data);
            } catch (err) {
                console.error('Failed to fetch states:', err);
            }
        };
        fetchStates();
    }, []);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                let prop = await propertyService.getOne(id, token || null);
                
                // Extract amenities and clean description
                let amenities = prop.amenities || [];
                let description = prop.description || '';
                
                if (amenities.length === 0 && description.includes('Amenities:')) {
                    const parts = description.split('Amenities:');
                    description = parts[0].trim();
                    amenities = parts[1].split(',').map((a: string) => a.trim());
                } else if (description.includes('Amenities:')) {
                    description = description.split('Amenities:')[0].trim();
                }
                
                const updatedProp = { ...prop, amenities, description };
                setProperty(updatedProp);

                if (updatedProp.onboardedById) {
                    const ownerData = await userService.getById(updatedProp.onboardedById, token || null);
                    setOwner(ownerData);
                }

                const reelsData = await reelService.getAll(1, 20, id);
                setReels(reelsData.data);

                if (token && updatedProp.onboardedById) {
                    const following = await userService.isFollowing(updatedProp.onboardedById, token);
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
            {/* Compact Sticky Nav */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
                    {/* Left: back + actions */}
                    <button onClick={() => router.back()} className="group flex items-center gap-2.5 text-slate-700 hover:text-blue-600 transition-all font-black text-xs uppercase tracking-widest">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                        Back to Search
                    </button>
                    <div className="w-px h-5 bg-slate-200 mx-1" />
                    {isBuyer && (
                        <button
                            onClick={handleBucketAction}
                            className={`w-8 h-8 flex items-center justify-center border rounded-xl transition-all ${alreadyInBucket ? 'text-rose-500 border-rose-200 bg-rose-50' : 'text-slate-400 border-slate-100 bg-white hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100'}`}
                        >
                            <svg className="w-4 h-4" fill={alreadyInBucket ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={handleShare}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>

                    {/* Right: compact partner strip */}
                    <div className="ml-auto flex items-center gap-3">
                        <div className="w-px h-5 bg-slate-200" />
                        {/* Avatar + name — clickable → business profile */}
                        <Link
                            href={`/partner/${owner?.id}`}
                            className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity"
                        >
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm text-white flex-shrink-0 group-hover:scale-105 transition-transform">
                                {(owner?.firstName || 'P').charAt(0)}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-black text-slate-800 leading-none">{owner?.firstName} {owner?.lastName}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate max-w-[140px]">{owner?.propertyPartnerProfile?.companyName || ''}</p>
                            </div>
                        </Link>
                        <div className="w-px h-5 bg-slate-200 hidden sm:block" />
                        {/* Inquire button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl font-black text-xs tracking-tight hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-200"
                        >
                            Inquire Now
                        </button>
                        {/* Follow button */}
                        {owner && (!token || (user?.userId !== owner.id && activeContext.activeRole.id === 'BUYER')) && (
                            <button
                                onClick={handleFollow}
                                disabled={followLoading}
                                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs border transition-all ${
                                    isFollowing
                                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                {followLoading ? (
                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : isFollowing ? (
                                    <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Following</>
                                ) : (
                                    <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Follow</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full">
                    {/* Main Content — full width */}
                    <div className="space-y-12">
                        {/* Hero Section */}
                        <div className="rounded-[4rem] overflow-hidden relative shadow-2xl border-[12px] border-white" style={{ background: '#e2e8f0' }}>
                            {/* Main hero image */}
                            <div className="aspect-[16/10] sm:aspect-video relative overflow-hidden">
                                {(property as any).images && (property as any).images.length > 0 ? (
                                    <>
                                        <img
                                            key={activeImageIndex}
                                            src={(property as any).images[activeImageIndex]}
                                            alt={`${property.name} - image ${activeImageIndex + 1}`}
                                            className="w-full h-full object-cover transition-opacity duration-500"
                                        />
                                        {/* Arrow controls */}
                                        {(property as any).images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setActiveImageIndex(i => (i - 1 + (property as any).images.length) % (property as any).images.length)}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-xl border border-white/20 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all duration-300 z-10"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => setActiveImageIndex(i => (i + 1) % (property as any).images.length)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-xl border border-white/20 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all duration-300 z-10"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                                </button>
                                                {/* Dot indicators */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                                    {((property as any).images as string[]).map((_: string, i: number) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setActiveImageIndex(i)}
                                                            className={`rounded-full transition-all duration-300 ${i === activeImageIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                        <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                                <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between pointer-events-none">
                                    <div className="flex gap-4 pointer-events-auto">
                                        {property.status === 'APPROVED' && <span className="px-6 py-3 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl shadow-2xl backdrop-blur-md ring-1 ring-white/20">Ready to Move</span>}
                                    </div>
                                    <div className="flex gap-3 pointer-events-auto">

                                        <button 
                                            onClick={() => setIsFullscreen(true)}
                                            className="w-16 h-16 bg-white/20 backdrop-blur-2xl border border-white/30 text-white rounded-3xl flex items-center justify-center hover:bg-white hover:text-blue-600 transition-all duration-500"
                                        >
                                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Thumbnail strip */}
                            {(property as any).images && (property as any).images.length > 1 && (
                                <div className="flex gap-2 p-3 bg-white/10 backdrop-blur-sm overflow-x-auto">
                                    {((property as any).images as string[]).map((img: string, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImageIndex(i)}
                                            className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${i === activeImageIndex ? 'border-blue-500 scale-105 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        >
                                            <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
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
                                        { label: 'Configuration', val: property.bedrooms ? `${property.bedrooms} BHK` : 'N/A', svgIcon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg> },
                                        { label: 'Sanitary', val: property.bathrooms ? `${property.bathrooms} Bath` : 'N/A', svgIcon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg> },
                                        { label: 'Carpet Area', val: property.area ? `${property.area} sqft` : 'N/A', svgIcon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg> },
                                        { label: 'Category', val: property.projectType || 'N/A', svgIcon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-all">
                                            <span className="mb-4 text-slate-500 group-hover:scale-125 transition-transform duration-300">{stat.svgIcon}</span>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                            <p className="text-xl font-black text-slate-900">{stat.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Project Description Section */}
                        <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/20 mb-12">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                </div>
                                Project Description
                            </h3>
                            <div className="prose prose-slate max-w-none">
                                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                    {property.description || ''}
                                </p>
                            </div>
                        </div>

                        {/* Location Details Section */}
                        <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/20 mb-12">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                Location Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="col-span-1 sm:col-span-2 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Street Address</p>
                                    <p className="text-lg font-bold text-slate-900">{property.addressRecord?.line1 || property.address || 'N/A'}</p>
                                    {property.addressRecord?.line2 && (
                                        <p className="text-sm text-slate-500 font-medium mt-1">{property.addressRecord.line2}</p>
                                    )}
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">City</p>
                                    <p className="text-lg font-bold text-slate-900">{property.addressRecord?.city?.name || property.cityName || property.city?.name || 'N/A'}</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">State</p>
                                    <p className="text-lg font-bold text-slate-900">
                                        {stateMap[property.addressRecord?.city?.state || ''] || property.addressRecord?.city?.state || property.state || property.city?.state || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pincode</p>
                                    <p className="text-lg font-bold text-slate-900">{property.addressRecord?.pincode || property.pincode || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Key Highlights Section */}
                        <div className="grid md:grid-cols-5 gap-12 mb-12">
                            <div className="md:col-span-3 bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
                                <h4 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Key Highlights</h4>
                                <ul className="space-y-5">
                                    {(property.highlights && property.highlights.length > 0) ? (
                                        property.highlights.map((h, i) => (
                                            <li key={i} className="flex items-center gap-4 text-slate-600 font-bold transition-all hover:translate-x-2 text-left">
                                                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm">{h}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-slate-400 font-bold text-sm italic text-left">No specific highlights listed by the partner yet.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Amenities Section — same style as Key Highlights */}
                        <div className="md:col-span-3 bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
                            <h4 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Amenities</h4>
                            <ul className="space-y-5">
                                {(property.amenities && property.amenities.length > 0) ? (
                                    property.amenities.map((amenity: string, i: number) => (
                                        <li key={i} className="flex items-center gap-4 text-slate-600 font-bold transition-all hover:translate-x-2 text-left">
                                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-sm">{amenity}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-slate-400 font-bold text-sm italic text-left">No amenities listed by the partner yet.</li>
                                )}
                            </ul>
                        </div>

                        {/* Property Reels Section */}
                        {reels && reels.length > 0 && (
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

                {/* Full Width 3D Unit Explorer Section */}
                <div className="mt-24 -mx-4 sm:-mx-6 lg:-mx-8">
                    <UnitExplorer3D 
                        projectId={id} 
                        mainImage={property.images && property.images.length > 0 ? property.images[0] : undefined} 
                    />
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
            {/* Fullscreen Image Overlay */}
            {isFullscreen && (property as any).images && (property as any).images.length > 0 && (
                <div 
                    className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300"
                    onClick={() => setIsFullscreen(false)}
                >
                    <button 
                        onClick={() => setIsFullscreen(false)}
                        className="absolute top-8 right-8 w-14 h-14 bg-white/10 hover:bg-rose-500 hover:scale-110 text-white rounded-2xl flex items-center justify-center transition-all duration-300 z-[110] border border-white/10 shadow-2xl"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <div className="relative w-full h-full flex items-center justify-center max-w-6xl" onClick={(e) => e.stopPropagation()}>
                         {/* Navigation arrows in fullscreen */}
                         {(property as any).images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveImageIndex(i => (i - 1 + (property as any).images.length) % (property as any).images.length)}
                                    className="absolute -left-4 sm:left-4 top-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-white/5 hover:bg-white/20 hover:scale-110 text-white rounded-[2rem] flex items-center justify-center transition-all duration-500 z-[110] border border-white/10 backdrop-blur-md shadow-2xl"
                                >
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={() => setActiveImageIndex(i => (i + 1) % (property as any).images.length)}
                                    className="absolute -right-4 sm:right-4 top-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-white/5 hover:bg-white/20 hover:scale-110 text-white rounded-[2rem] flex items-center justify-center transition-all duration-500 z-[110] border border-white/10 backdrop-blur-md shadow-2xl"
                                >
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </>
                        )}
                        
                        <img 
                            src={(property as any).images[activeImageIndex]} 
                            alt={property.name}
                            className="max-w-full max-h-[85vh] object-contain rounded-[2rem] sm:rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-white/5 animate-in zoom-in-95 duration-500"
                        />
                        
                        {/* Index and metadata */}
                        <div className="absolute -bottom-12 left-0 right-0 flex flex-col items-center gap-4">
                            <div className="px-8 py-3 bg-white/5 backdrop-blur-xl rounded-2xl text-white border border-white/10 shadow-2xl flex items-center gap-6">
                                <span className="text-xs font-black uppercase tracking-[0.3em] opacity-50">Gallery View</span>
                                <div className="w-px h-4 bg-white/20" />
                                <span className="font-black text-lg tracking-tight">
                                    {activeImageIndex + 1} <span className="text-white/30 mx-1">/</span> {(property as any).images.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
