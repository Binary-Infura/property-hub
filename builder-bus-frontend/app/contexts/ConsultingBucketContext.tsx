'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

interface BucketItem {
    id: string;
    title: string;
    price: string;
    location: string;
}

interface ConsultingBucketContextType {
    items: BucketItem[];
    addItem: (item: BucketItem) => void;
    removeItem: (id: string) => void;
    clearBucket: () => void;
    itemCount: number;
    isInBucket: (id: string) => boolean;
}

const ConsultingBucketContext = createContext<ConsultingBucketContextType | undefined>(undefined);

export function ConsultingBucketProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<BucketItem[]>([]);
    const { authenticated } = useAuth();
    const router = useRouter();

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('consulting_bucket');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse bucket items", e);
            }
        }
    }, []);

    // Save to localStorage when items change
    useEffect(() => {
        localStorage.setItem('consulting_bucket', JSON.stringify(items));
    }, [items]);

    // Clear bucket on logout
    useEffect(() => {
        if (!authenticated && items.length > 0) {
            setItems([]);
            localStorage.removeItem('consulting_bucket');
        }
    }, [authenticated]);

    const addItem = (item: BucketItem) => {
        if (!authenticated) {
            // Store target in local storage temporarily to recover after auth
            localStorage.setItem('redirect_after_auth', '/search');
            router.push('/signin');
            return;
        }

        setItems(prev => {
            if (prev.find(i => i.id === item.id)) return prev;
            return [...prev, item];
        });
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const clearBucket = () => {
        setItems([]);
    };

    const isInBucket = (id: string) => {
        return items.some(i => i.id === id);
    };

    return (
        <ConsultingBucketContext.Provider value={{
            items,
            addItem,
            removeItem,
            clearBucket,
            itemCount: items.length,
            isInBucket
        }}>
            {children}
        </ConsultingBucketContext.Provider>
    );
}

export function useConsultingBucket() {
    const context = useContext(ConsultingBucketContext);
    if (context === undefined) {
        throw new Error('useConsultingBucket must be used within a ConsultingBucketProvider');
    }
    return context;
}
