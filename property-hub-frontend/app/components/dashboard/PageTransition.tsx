'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React, { useMemo } from 'react';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';

/**
 * Role-specific palettes for the "Aura Bloom" effect.
 */
const ROLE_THEMES: Record<string, { primary: string; secondary: string; glow: string }> = {
    CENTRAL_AUTHORITY: { primary: '#6366f1', secondary: '#4f46e5', glow: 'rgba(99, 102, 241, 0.15)' },
    GROWTH_PARTNER: { primary: '#a855f7', secondary: '#9333ea', glow: 'rgba(168, 85, 247, 0.15)' },
    PROPERTY_PARTNER: { primary: '#3b82f6', secondary: '#2563eb', glow: 'rgba(59, 130, 246, 0.15)' },
    CONSULTANT: { primary: '#10b981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.15)' },
    LOAN_PARTNER: { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.15)' },
    BUYER: { primary: '#f43f5e', secondary: '#e11d48', glow: 'rgba(244, 63, 94, 0.15)' },
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { activeContext } = useUnifiedApp();
    const activeRole = activeContext.activeRole.id;
    const theme = ROLE_THEMES[activeRole] || ROLE_THEMES.CENTRAL_AUTHORITY;

    // Generate random seed for floating elements
    const orbs = useMemo(() => [
        { id: 1, size: '40vw', x: '-10%', y: '-10%', duration: 15 },
        { id: 2, size: '30vw', x: '70%', y: '60%', duration: 18 },
        { id: 3, size: '25vw', x: '20%', y: '80%', duration: 12 },
    ], []);

    return (
        <>
            {/* Global Overlay Elements (Non-sliding) */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`global-${pathname}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] pointer-events-none overflow-hidden select-none"
                >
                    {/* Progress Beam at Absolute Top of Screen */}
                    <motion.div
                        className="fixed top-0 left-0 right-0 h-[3px] z-[101] origin-left"
                        initial={{ scaleX: 0, opacity: 1 }}
                        animate={{ scaleX: 1, opacity: 0 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }}
                    />

                    {/* Aura Bloom Background Orbs */}
                    {orbs.map((orb) => (
                        <motion.div
                            key={orb.id}
                            className="absolute rounded-full"
                            style={{
                                width: orb.size,
                                height: orb.size,
                                background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
                                left: orb.x,
                                top: orb.y,
                                filter: 'blur(40px)',
                                opacity: 0.6,
                                mixBlendMode: 'screen'
                            }}
                            animate={{
                                x: [0, 50, -30, 0],
                                y: [0, -40, 60, 0],
                                scale: [1, 1.1, 0.9, 1],
                            }}
                            transition={{
                                duration: orb.duration,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    ))}

                    {/* Sweep Effect Line */}
                    <motion.div 
                        className="absolute inset-0 z-[1] w-[200%] h-full pointer-events-none"
                        initial={{ x: '-100%', skewX: -25 }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.2, ease: "circOut", delay: 0.1 }}
                        style={{
                            background: `linear-gradient(90deg, transparent 0%, ${theme.primary}08 45%, ${theme.primary}15 50%, ${theme.primary}08 55%, transparent 100%)`
                        }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* Page Content Transition (Sliding) */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={{
                        initial: { opacity: 0, y: 20, scale: 0.99 },
                        animate: { 
                            opacity: 1, 
                            y: 0, 
                            scale: 1, 
                            transition: {
                                duration: 0.75,
                                ease: [0.16, 1, 0.3, 1],
                                staggerChildren: 0.1
                            }
                        },
                        exit: { 
                            opacity: 0, 
                            y: -12, 
                            scale: 1.01, 
                            transition: { duration: 0.45, ease: 'easeInOut' }
                        }
                    }}
                    className="w-full h-full relative"
                >
                    <motion.div
                        variants={{
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0 }
                        }}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </>
    );
}
