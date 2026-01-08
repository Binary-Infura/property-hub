'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Property, PropertyStatus } from '@/app/types/property';
import { PROPERTY_STATUS_CONFIG, PROPERTY_TYPES } from '@/app/constants/property';

type FilterStatus = PropertyStatus | 'all';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize properties from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('builder_properties');
    if (saved) {
      setProperties(JSON.parse(saved));
    }
  }, []);

  const filteredProperties = properties.filter(prop => {
    const statusMatch = filterStatus === 'all' || prop.status === filterStatus;
    const searchMatch = prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       prop.location.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const statusCounts = {
    draft: properties.filter(p => p.status === 'draft').length,
    submitted: properties.filter(p => p.status === 'submitted').length,
    approved: properties.filter(p => p.status === 'approved').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
    published: properties.filter(p => p.status === 'published').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-1">Manage and organize your real estate properties</p>
        </div>
        <Link
          href="/builder/dashboard/properties/add"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-600 text-sm font-medium">Draft</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{statusCounts.draft}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-600 text-sm font-medium">Submitted</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{statusCounts.submitted}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-600 text-sm font-medium">Approved</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{statusCounts.approved}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-600 text-sm font-medium">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{statusCounts.rejected}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-gray-600 text-sm font-medium">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{properties.length}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Search properties by name or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({properties.length})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'draft'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Draft ({statusCounts.draft})
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'submitted'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Submitted ({statusCounts.submitted})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({statusCounts.approved})
            </button>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM14 5a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V5zM4 15a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 15a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Properties List/Grid */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m-4 4l-4-4m9-5l4-4m-4 4l-4-4" />
          </svg>
          <p className="text-gray-500 text-lg font-medium mb-2">No properties found</p>
          <p className="text-gray-400 mb-4">
            {searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Create your first property to get started'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <Link
              href="/builder/dashboard/properties/add"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Create Property
            </Link>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Buildings</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProperties.map(property => {
                const statusConfig = PROPERTY_STATUS_CONFIG[property.status];
                return (
                  <tr key={property.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{property.title}</p>
                        <p className="text-sm text-gray-500">₹{(property.startingPrice / 100000).toFixed(1)}L+</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{property.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 capitalize">{property.propertyType.replace('-', ' ')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{property.totalBuildings}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/builder/dashboard/properties/${property.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => {
            const statusConfig = PROPERTY_STATUS_CONFIG[property.status];
            return (
              <Link
                key={property.id}
                href={`/builder/dashboard/properties/${property.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition"
              >
                <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m-4 4l-4-4m9-5l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{property.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{property.location}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <p className="text-sm font-semibold text-gray-700">₹{(property.startingPrice / 100000).toFixed(1)}L+</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-gray-500">Buildings</p>
                      <p className="font-bold text-gray-900">{property.totalBuildings}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Units</p>
                      <p className="font-bold text-gray-900">{property.totalUnits}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Area</p>
                      <p className="font-bold text-gray-900">{property.totalArea}K</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
