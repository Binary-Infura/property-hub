'use client';

import { useState } from 'react';
import PropertyReviewCard from '@/app/components/PropertyReviewCard';
import PropertyDetailModal from '@/app/components/PropertyDetailModal';

interface InternalNote {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

interface PropertySubmission {
  id: string;
  title: string;
  config: string;
  location: string;
  price: string;
  area: string;
  age: string;
  description: string;
  amenities: string[];
  images: string[];
  brochure?: string;
  builderName: string;
  builderEmail: string;
  submittedAt: Date;
  status: 'submitted' | 'approved' | 'rejected' | 'live';
  internalNotes: InternalNote[];
  rejectionReason?: string;
  approvalDate?: Date;
  liveDate?: Date;
}

export default function AdminDashboard() {
  const [properties, setProperties] = useState<PropertySubmission[]>([
    {
      id: '1',
      title: 'Sunset Towers, Bandra',
      config: '3 BHK',
      location: 'Bandra, Mumbai',
      price: '₹85L',
      area: '1800 sqft',
      age: '2-year old',
      description: 'Premium residential project with world-class amenities in the heart of Bandra. Modern architecture with excellent connectivity.',
      amenities: ['Swimming Pool', 'Gym', 'Garden', 'Security'],
      images: ['image1.jpg', 'image2.jpg'],
      builderName: 'Builder A',
      builderEmail: 'builder@example.com',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'submitted',
      internalNotes: [],
    },
    {
      id: '2',
      title: 'Green Valley Homes, Powai',
      config: '2 BHK',
      location: 'Powai, Mumbai',
      price: '₹52L',
      area: '1200 sqft',
      age: '1-year old',
      description: 'Eco-friendly residential community with modern amenities and excellent connectivity. Perfect for families.',
      amenities: ['Parking', 'Community Hall', 'Garden'],
      images: ['image3.jpg'],
      builderName: 'Builder B',
      builderEmail: 'builder2@example.com',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'submitted',
      internalNotes: [],
    },
  ]);

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'live'>('pending');
  const [selectedProperty, setSelectedProperty] = useState<PropertySubmission | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleApprove = (id: string, goLive: boolean = false) => {
    setProperties(properties.map(p =>
      p.id === id
        ? {
            ...p,
            status: goLive ? 'live' : 'approved',
            approvalDate: new Date(),
            liveDate: goLive ? new Date() : undefined,
          }
        : p
    ));
    setShowModal(false);
  };

  const handleReject = (id: string, reason: string) => {
    setProperties(properties.map(p =>
      p.id === id
        ? {
            ...p,
            status: 'rejected',
            rejectionReason: reason,
          }
        : p
    ));
    setShowModal(false);
  };

  const handleAddNote = (id: string, note: string) => {
    setProperties(properties.map(p =>
      p.id === id
        ? {
            ...p,
            internalNotes: [
              ...p.internalNotes,
              {
                id: Date.now().toString(),
                text: note,
                author: 'Admin User',
                timestamp: new Date(),
              },
            ],
          }
        : p
    ));
  };

  const handlePublish = (id: string) => {
    setProperties(properties.map(p =>
      p.id === id
        ? {
            ...p,
            status: 'live',
            liveDate: new Date(),
          }
        : p
    ));
    setShowModal(false);
  };

  const pendingCount = properties.filter(p => p.status === 'submitted').length;
  const approvedCount = properties.filter(p => p.status === 'approved').length;
  const rejectedCount = properties.filter(p => p.status === 'rejected').length;
  const liveCount = properties.filter(p => p.status === 'live').length;

  const filteredProperties = properties.filter(p => {
    if (activeTab === 'pending') return p.status === 'submitted';
    if (activeTab === 'approved') return p.status === 'approved';
    if (activeTab === 'rejected') return p.status === 'rejected';
    if (activeTab === 'live') return p.status === 'live';
    return false;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Review Center</h1>
            <p className="text-gray-600 mt-1">Review and manage builder-submitted properties</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{approvedCount}</p>
            <p className="text-xs text-gray-500 mt-2">Ready to publish</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Live</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{liveCount}</p>
            <p className="text-xs text-gray-500 mt-2">Published on platform</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{rejectedCount}</p>
            <p className="text-xs text-gray-500 mt-2">Awaiting resubmission</p>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                Pending ({pendingCount})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
                activeTab === 'approved'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                Approved ({approvedCount})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
                activeTab === 'live'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                Live ({liveCount})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
                activeTab === 'rejected'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                Rejected ({rejectedCount})
              </span>
            </button>
          </div>

          {/* Properties List */}
          <div className="p-6">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 font-medium">No properties in this category</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProperties.map(property => (
                  <PropertyReviewCard
                    key={property.id}
                    property={property}
                    onViewDetails={() => {
                      setSelectedProperty(property);
                      setShowModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => {
            setShowModal(false);
            setSelectedProperty(null);
          }}
          onApprove={(goLive) => handleApprove(selectedProperty.id, goLive)}
          onReject={handleReject}
          onAddNote={(note) => handleAddNote(selectedProperty.id, note)}
          onPublish={() => handlePublish(selectedProperty.id)}
        />
      )}
    </div>
  );
}
