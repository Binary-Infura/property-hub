'use client';

import { MOCK_REGIONS } from '@/app/lib/mock-central-authority';
import Link from 'next/link';

export default function RegionsPage() {
    const regions = MOCK_REGIONS;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Region Management</h1>
                    <p className="text-gray-600 mt-2">Manage all regions and their respective managers.</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    + Add New Region
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Region Name</th>
                                <th className="px-6 py-3">Managers</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Properties</th>
                                <th className="px-6 py-3">Revenue</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {regions.map((region) => (
                                <tr key={region.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">{region.name}</td>
                                    <td className="px-6 py-4">{region.managers.join(', ')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${region.status === 'active' ? 'bg-green-100 text-green-700' :
                                            region.status === 'warning' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {region.status.charAt(0).toUpperCase() + region.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{region.propertiesCount}</td>
                                    <td className="px-6 py-4">₹{(region.revenue / 100000).toFixed(1)}L</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                                            <button className="text-red-600 hover:text-red-800 font-medium">Disable</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
