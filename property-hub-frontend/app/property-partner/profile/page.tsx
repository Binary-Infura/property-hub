'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';

export default function BusinessProfilePage() {
    const router = useRouter();
    const { setIsProfileOpen } = useUnifiedApp();

    useEffect(() => {
        // Automatically open the drawer and redirect back to dashboard
        setIsProfileOpen(true);
        router.replace('/dashboard');
    }, [router, setIsProfileOpen]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Opening your profile...</p>
        </div>
    );
}
