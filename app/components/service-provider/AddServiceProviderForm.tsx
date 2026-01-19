'use client';

import { useState } from 'react';
import { ServiceCategory, ServiceProviderFormData } from '@/app/types/service-provider';

// Hardcoded for now, can be moved to constants
const SERVICE_CATEGORIES: { label: string; value: ServiceCategory }[] = [
    { label: 'Painting', value: 'painting' },
    { label: 'Plumbing', value: 'plumbing' },
    { label: 'Electrical', value: 'electrical' },
    { label: 'Carpentry', value: 'carpentry' },
    { label: 'Cleaning', value: 'cleaning' },
    { label: 'Pest Control', value: 'pest-control' },
    { label: 'Appliance Repair', value: 'appliance-repair' },
    { label: 'Interior Design', value: 'interior-design' },
    { label: 'Furniture', value: 'furniture' },
    { label: 'Other', value: 'other' },
];

interface ServiceProviderFormProps {
    initialData?: Partial<ServiceProviderFormData>;
    onCancel?: () => void;
    onSubmit: (data: any) => void;
    isEditing?: boolean;
}

export default function ServiceProviderForm({ initialData, onCancel, onSubmit, isEditing = false }: ServiceProviderFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        businessName: initialData?.businessName || '',
        category: (initialData?.category as ServiceCategory) || 'painting',
        location: initialData?.location || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '',
        availabilityDays: initialData?.availabilityDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availabilityHours: initialData?.availabilityHours || '09:00 AM - 06:00 PM',
        rates: initialData?.rates || '',
        portfolio: (initialData?.portfolio as any) || '', // Simplified for string URL
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name (Optional)</label>
                    <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Doe Services"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {SERVICE_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location / Service Area</label>
                    <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Mumbai, Bandra West"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability Hours</label>
                    <input
                        type="text"
                        value={formData.availabilityHours}
                        onChange={(e) => setFormData({ ...formData, availabilityHours: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="09:00 AM - 06:00 PM"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rates / Pricing</label>
                    <input
                        type="text"
                        value={formData.rates}
                        onChange={(e) => setFormData({ ...formData, rates: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. ₹500/hr or Visit Charge ₹200"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Work Samples (Optional URL)</label>
                <input
                    type="text"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/portfolio"
                />
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                    {isEditing ? 'Save Changes' : 'Add Service Provider'}
                </button>
            </div>
        </form>
    );
}
