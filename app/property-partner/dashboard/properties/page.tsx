'use client';

import { useState } from 'react';

interface AssignedProperty {
    id: string;
    title: string;
    location: string;
    priceStart: string;
    unitsAvailable: number;
    status: 'active' | 'sold-out' | 'paused';
}

export default function AssignedPropertiesPage() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Mock Data (Assigned to this Partner)
    const [properties, setProperties] = useState<AssignedProperty[]>([
        {
            id: 'p1',
            title: 'Sunset Heights',
            location: 'Andheri West, Mumbai',
            priceStart: '₹2.5 Cr',
            unitsAvailable: 4,
            status: 'active',
        },
        {
            id: 'p3',
            title: 'Ocean View',
            location: 'Worli, Mumbai',
            priceStart: '₹4.2 Cr',
            unitsAvailable: 2,
            status: 'active',
        },
        {
            id: 'p5',
            title: 'Lakeside Residency',
            location: 'Powai, Mumbai',
            priceStart: '₹1.8 Cr',
            unitsAvailable: 0,
            status: 'sold-out',
        },
    ]);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
                    <p className="text-gray-600 mt-2">Manage properties you have added and are promoting.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2"
                >
                    <span>+</span> Add New Property
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition">
                        <div className="h-48 bg-gray-200 relative">
                            {/* Placeholder for Property Image */}
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <span className="text-4xl">🏙️</span>
                            </div>
                            <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${property.status === 'active' ? 'bg-green-500 text-white' :
                                property.status === 'sold-out' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                                }`}>
                                {property.status}
                            </span>
                        </div>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h3>
                            <p className="text-gray-500 text-sm mb-4">📍 {property.location}</p>

                            <div className="flex justify-between items-center py-4 border-t border-b border-gray-100 mb-4">
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase font-semibold">Starts From</span>
                                    <span className="block font-bold text-blue-600 text-lg">{property.priceStart}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs text-gray-500 uppercase font-semibold">Available</span>
                                    <span className="block font-bold text-gray-900 text-lg">{property.unitsAvailable} Units</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                                    Manage Leads
                                </button>
                                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition">
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isAddModalOpen && (
                <div id="pp-add-property-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Add New Property</h2>
                        <p className="text-gray-500 mb-6">Listing a new property under your management.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Property</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
