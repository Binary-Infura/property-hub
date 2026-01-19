'use client';

import { useState } from 'react';

interface VisitExecutive {
    id: string;
    name: string;
    email: string;
    phone: string;
    region: string;
    visitsConducted: number;
    rating: number;
    status: 'active' | 'inactive';
    createdAt: string;
}

export default function VisitExecutivesPage() {
    const [executives, setExecutives] = useState<VisitExecutive[]>([
        {
            id: '1',
            name: 'Vikram Singh',
            email: 'vikram.s@propertyhub.com',
            phone: '+91 98765 43210',
            region: 'North Zone',
            visitsConducted: 45,
            rating: 4.8,
            status: 'active',
            createdAt: '2024-01-15',
        },
        {
            id: '2',
            name: 'Priya Sharma',
            email: 'priya.s@propertyhub.com',
            phone: '+91 98765 09876',
            region: 'South Zone',
            visitsConducted: 32,
            rating: 4.5,
            status: 'active',
            createdAt: '2024-02-10',
        },
        {
            id: '3',
            name: 'Rohan Gupta',
            email: 'rohan.g@propertyhub.com',
            phone: '+91 99887 77665',
            region: 'East Zone',
            visitsConducted: 12,
            rating: 4.2,
            status: 'inactive',
            createdAt: '2024-03-05',
        },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedExecutive, setSelectedExecutive] = useState<VisitExecutive | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        region: '',
    });

    const handleAddExecutive = () => {
        setFormData({ name: '', email: '', phone: '', region: '' });
        setShowAddModal(true);
    };

    const handleEditExecutive = (executive: VisitExecutive) => {
        setFormData({
            name: executive.name,
            email: executive.email,
            phone: executive.phone,
            region: executive.region,
        });
        setSelectedExecutive(executive);
        setShowEditModal(true);
    };

    const handleSaveExecutive = () => {
        if (selectedExecutive) {
            // Edit existing
            setExecutives(executives.map(e =>
                e.id === selectedExecutive.id
                    ? { ...e, ...formData }
                    : e
            ));
            setShowEditModal(false);
        } else {
            // Add new
            const newExecutive: VisitExecutive = {
                id: Date.now().toString(),
                ...formData,
                visitsConducted: 0,
                rating: 0,
                status: 'active',
                createdAt: new Date().toISOString().split('T')[0],
            };
            setExecutives([...executives, newExecutive]);
            setShowAddModal(false);
        }
        setFormData({ name: '', email: '', phone: '', region: '' });
        setSelectedExecutive(null);
    };

    const handleToggleStatus = (id: string) => {
        setExecutives(executives.map(e =>
            e.id === id
                ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' }
                : e
        ));
    };

    const activeCount = executives.filter(e => e.status === 'active').length;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Visit Executives</h1>
                        <p className="text-gray-600 mt-1">Manage visit executives and track property visits</p>
                    </div>
                    <button
                        onClick={handleAddExecutive}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Executive
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Executives</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{executives.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Active</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-600 text-sm font-medium">Total Visits Conducted</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                        {executives.reduce((sum, e) => sum + e.visitsConducted, 0)}
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Region</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Visits</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {executives.map((executive) => (
                                    <tr key={executive.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{executive.name}</p>
                                                <p className="text-sm text-gray-500">{executive.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-gray-700">{executive.region}</td>
                                        <td className="py-4 px-4 text-gray-700">{executive.phone}</td>
                                        <td className="py-4 px-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                {executive.visitsConducted}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-400">★</span>
                                                <span className="text-gray-700">{executive.rating > 0 ? executive.rating : 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${executive.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {executive.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditExecutive(executive)}
                                                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(executive.id)}
                                                    className={`px-3 py-1 rounded text-sm font-medium ${executive.status === 'active'
                                                        ? 'text-red-600 hover:bg-red-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {executive.status === 'active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal (Shared for Add/Edit) */}
            {(showAddModal || showEditModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {showEditModal ? 'Edit Visit Executive' : 'Add New Visit Executive'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Region / Area</label>
                                <input
                                    type="text"
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                    setFormData({ name: '', email: '', phone: '', region: '' });
                                }}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveExecutive}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                {showEditModal ? 'Save Changes' : 'Add Executive'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
