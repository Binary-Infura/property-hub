'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoleSwitchTransitionProps {
    isVisible: boolean;
    roleName: string;
    roleId: string;
}

const ROLE_ICONS: Record<string, string> = {
    CENTRAL_AUTHORITY: '🏛️',
    GROWTH_PARTNER: '📣',
    PROPERTY_PARTNER: '🏢',
    CONSULTANT: '🤝',
    LOAN_PARTNER: '💰',
    BUYER: '🔑',
};

const UNIFIED_CONFIG = {
    gradient: 'from-blue-900 via-blue-800 to-cyan-900',
    accent: '#3b82f6',
};

export default function RoleSwitchTransition({ isVisible, roleName, roleId }: RoleSwitchTransitionProps) {
    const [particles, setParticles] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);
    const icon = ROLE_ICONS[roleId] ?? '🏢';
    const config = UNIFIED_CONFIG;

    useEffect(() => {
        if (isVisible) {
            setParticles(
                Array.from({ length: 18 }, () => ({
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 6 + 2,
                    delay: Math.random() * 0.8,
                }))
            );
        }
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="role-switch-overlay"
                    className={`fixed inset-0 z-[99999] w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br ${config.gradient} overflow-hidden`}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.35, ease: 'easeIn' } }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                    {/* Animated background glow */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.4, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                        style={{
                            background: `radial-gradient(ellipse at 50% 50%, ${config.accent}55 0%, transparent 70%)`,
                        }}
                    />

                    {/* Floating particles */}
                    {particles.map((p, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full opacity-20"
                            style={{
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                                width: p.size,
                                height: p.size,
                                backgroundColor: config.accent,
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: [0, 0.4, 0], y: -60 }}
                            transition={{
                                duration: 2,
                                delay: p.delay,
                                repeat: Infinity,
                                repeatDelay: Math.random() * 1.5,
                                ease: 'easeOut',
                            }}
                        />
                    ))}

                    {/* Main content */}
                    <div className="relative z-10 flex flex-col items-center gap-6 select-none">
                        {/* Role icon */}
                        <motion.div
                            className="text-7xl"
                            initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                        >
                            {icon}
                        </motion.div>

                        {/* "Switching to" label */}
                        <motion.p
                            className="text-white/60 text-sm font-semibold uppercase tracking-[0.2em]"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                        >
                            Switching to
                        </motion.p>

                        <motion.h1
                            className="text-white text-4xl font-black text-center tracking-tight drop-shadow-xl relative overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                                opacity: 1, 
                                y: 0,
                                backgroundImage: [
                                    'linear-gradient(110deg, #fff 45%, #ffffffaa 50%, #fff 55%)',
                                    'linear-gradient(110deg, #fff 0%, #ffffffaa 5%, #fff 10%)',
                                    'linear-gradient(110deg, #fff 90%, #ffffffaa 95%, #fff 100%)'
                                ],
                                backgroundSize: '200% 100%',
                            }}
                            transition={{ 
                                delay: 0.25, 
                                opacity: { duration: 0.45 },
                                y: { duration: 0.45, ease: 'easeOut' },
                                backgroundImage: { duration: 2, repeat: Infinity, ease: 'linear' }
                            }}
                            style={{
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundImage: 'linear-gradient(110deg, #fff 45%, #ffffffaa 50%, #fff 55%)',
                            }}
                        >
                            {roleName}
                        </motion.h1>

                        {/* Animated progress bar */}
                        <motion.div
                            className="w-48 h-[3px] rounded-full bg-white/20 overflow-hidden mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: config.accent }}
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ delay: 0.5, duration: 1.2, ease: 'easeInOut' }}
                            />
                        </motion.div>

                        {/* Spinner dots */}
                        <div className="flex gap-2 mt-1">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: config.accent }}
                                    initial={{ opacity: 0.2 }}
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Bottom corner branding */}
                    <motion.div
                        className="absolute bottom-8 flex items-center gap-2 opacity-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="w-5 h-5 bg-white rounded-md" />
                        <span className="text-white text-sm font-bold tracking-wide">PropertyHub</span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
