'use client';

import React from 'react';
import ProfileForm from '@/app/components/profile/ProfileForm';

export default function UnifiedProfilePage() {
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="mb-8 font-black">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Personal Profile</h1>
                <p className="text-gray-500 mt-2 text-sm font-medium">Manage your personal information and account preferences.</p>
            </div>
            <ProfileForm />
        </div>
    );
}
