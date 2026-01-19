'use client';

import { useState } from 'react';
import ServiceProviderForm from '@/app/components/service-provider/AddServiceProviderForm';
import { ServiceProviderFormData } from '@/app/types/service-provider';

export default function ServiceProviderProfilePage() {
    // Mock logged-in user data
    const [profileData, setProfileData] = useState<Partial<ServiceProviderFormData>>({
        name: 'Ramesh Gupta',
        businessName: 'Gupta Painting Services',
        category: 'painting',
        location: 'Mumbai, Bandra',
        phone: '+91 98765 43210',
        email: 'ramesh@example.com',
        availabilityDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        availabilityHours: '09:00 AM - 07:00 PM',
        rates: '₹300/sqft',
        portfolio: [] as any, // Mock
    });

    const handleSave = (data: any) => {
        setProfileData(data);
        alert('Profile updated successfully!');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">Manage your business details and availability</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <ServiceProviderForm
                    initialData={profileData}
                    onSubmit={handleSave}
                    isEditing={true}
                />
            </div>
        </div>
    );
}
