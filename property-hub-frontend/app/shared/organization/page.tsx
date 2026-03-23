'use client';

import React from 'react';
import OrganizationForm from '@/app/components/profile/OrganizationForm';

export default function OrganizationPage() {
    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Organization Page</h1>
                <p className="text-gray-500 mt-2 text-sm font-medium italic">Configure how your company appears to consultants and buyers.</p>
            </div>
            <OrganizationForm />
        </div>
    );
}
