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
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name (Optional)</label>
                    <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                        placeholder="Doe Services"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                    >
                        {SERVICE_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location / Service Area</label>
                    <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                        placeholder="e.g. Mumbai, Bandra West"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                        placeholder="provider@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                    <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                        placeholder="+91 98765 43210"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Availability Hours</label>
                    <input
                        type="text"
                        value={formData.availabilityHours}
                        onChange={(e) => setFormData({ ...formData, availabilityHours: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                        placeholder="09:00 AM - 06:00 PM"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rates / Pricing</label>
                    <input
                        type="text"
                        value={formData.rates}
                        onChange={(e) => setFormData({ ...formData, rates: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                        placeholder="e.g. ₹500/hr or Visit Charge ₹200"
                    />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Portfolio / Work Samples (Optional URL)</label>
                    <input
                        type="text"
                        value={formData.portfolio}
                        onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                        placeholder="https://example.com/portfolio"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 text-sm"
                >
                    {isEditing ? 'Save Changes' : 'Add Service Provider'}
                </button>
            </div>
        </form>
    );
}
