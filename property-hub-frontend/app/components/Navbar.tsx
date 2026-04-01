'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useConsultingBucket } from '../contexts/ConsultingBucketContext';
import { useUnifiedApp, RoleId } from '../contexts/UnifiedAppContext';
import UserProfileMenu from './UserProfileMenu';


export default function Navbar() {
    const { authenticated, user, roles, token, logout, initialized, activeRole: activeRoleId } = useAuth();
    const { itemCount, items, removeItem } = useConsultingBucket();
    const { activeContext } = useUnifiedApp();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isBucketOpen, setIsBucketOpen] = useState(false);
    const bucketRef = useRef<HTMLDivElement>(null);

    const isBuyer = (activeRoleId === 'BUYER') && authenticated;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (bucketRef.current && !bucketRef.current.contains(event.target as Node)) {
                setIsBucketOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    return (
        <nav className="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                        <span className="font-bold text-lg text-gray-900">PropertyHub</span>
                    </Link>
                    <div className="hidden md:flex gap-8">
                        <Link href="/#how" className="text-gray-600 hover:text-gray-900 text-sm font-medium">How It Works</Link>
                        <Link href="/#why" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Why Us</Link>

                        <Link href="/reels" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Reels</Link>
                        <Link href="/partners" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Partner with Us</Link>
                        <Link href="/search" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Search</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {isBuyer && (
                            <div className="relative mr-2" ref={bucketRef}>
                                <button
                                    onClick={() => setIsBucketOpen(!isBucketOpen)}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {itemCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                            {itemCount}
                                        </span>
                                    )}
                                </button>

                                {isBucketOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Consulting Bucket</span>
                                            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-black">{itemCount} items</span>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                            {items.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-400">Your bucket is empty</p>
                                                    <Link href="/search" onClick={() => setIsBucketOpen(false)} className="text-xs text-blue-600 font-black mt-2 inline-block hover:underline">Browse Properties</Link>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-50">
                                                    {items.map((item) => (
                                                        <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors group">
                                                            <div className="flex justify-between items-start gap-3">
                                                                <div className="flex-1">
                                                                    <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                                                        <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                        </svg>
                                                                        {item.location}
                                                                    </div>
                                                                    <p className="text-xs font-black text-blue-600 mt-2">{item.price}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {items.length > 0 && (
                                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                                <Link
                                                    href={authenticated ? '/dashboard/saved' : '/consultation'}
                                                    onClick={() => setIsBucketOpen(false)}
                                                    className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black tracking-widest uppercase text-center block shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
                                                >
                                                    View All
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {initialized ? (
                            authenticated ? (
                                <UserProfileMenu />
                            ) : (
                                <>
                                    <Link href="/signin" className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">
                                        Login
                                    </Link>
                                    <Link href="/consultation" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap text-sm">
                                        Free Consultation
                                    </Link>
                                </>
                            )
                        ) : (
                            <div className="w-20 h-8 animate-pulse bg-gray-100 rounded-lg"></div>
                        )}
                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden ml-2 p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
                        <Link href="/#how" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">How It Works</Link>
                        <Link href="/#why" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">Why Us</Link>

                        <Link href="/reels" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">Reels</Link>
                        <Link href="/partners" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">Partner with Us</Link>
                        <Link href="/search" onClick={() => setIsMobileMenuOpen(false)} className="block px-2 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium hover:bg-gray-50 rounded-md">Search</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

