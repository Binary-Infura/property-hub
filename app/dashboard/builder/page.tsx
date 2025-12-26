'use client';

import { useState } from 'react';
import PropertyDraftForm from '@/app/components/PropertyDraftForm';
import PropertyDraftsList from '@/app/components/PropertyDraftsList';

interface PropertyDraft {
  id: string;
  title: string;
  config: string;
  location: string;
  price: string;
  area: string;
  age: string;
  description: string;
  amenities: string[];
  images: File[];
  brochure: File | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: Date;
  submittedAt?: Date;
  feedback?: string;
}

export default function BuilderDashboard() {
  const [drafts, setDrafts] = useState<PropertyDraft[]>([]);
  const [activeTab, setActiveTab] = useState<'drafts' | 'submitted' | 'approved'>('drafts');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddProperty = () => {
    setShowForm(true);
    setEditingId(null);
  };

  const handleEditProperty = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleSaveProperty = (property: PropertyDraft) => {
    if (editingId) {
      setDrafts(drafts.map(d => d.id === editingId ? { ...property, id: editingId } : d));
    } else {
      setDrafts([...drafts, { ...property, id: Date.now().toString(), createdAt: new Date() }]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmitProperty = (id: string) => {
    setDrafts(drafts.map(d => 
      d.id === id ? { ...d, status: 'submitted' as const, submittedAt: new Date() } : d
    ));
  };

  const handleDeleteProperty = (id: string) => {
    setDrafts(drafts.filter(d => d.id !== id));
  };

  const draftsList = drafts.filter(d => d.status === 'draft');
  const submittedList = drafts.filter(d => d.status === 'submitted');
  const approvedList = drafts.filter(d => d.status === 'approved' || d.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Builder Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and submit your properties for approval</p>
            </div>
            {!showForm && (
              <button
                onClick={handleAddProperty}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Property
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm ? (
          <PropertyDraftForm
            initialData={editingId ? drafts.find(d => d.id === editingId) : undefined}
            onSave={handleSaveProperty}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
        ) : (
          <>
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <p className="text-gray-600 text-sm font-medium">Draft Properties</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{draftsList.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <p className="text-gray-600 text-sm font-medium">Submitted</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{submittedList.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {approvedList.filter(d => d.status === 'approved').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{drafts.length}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('drafts')}
                  className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
                    activeTab === 'drafts'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Drafts ({draftsList.length})
                </button>
                <button
                  onClick={() => setActiveTab('submitted')}
                  className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
                    activeTab === 'submitted'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Submitted ({submittedList.length})
                </button>
                <button
                  onClick={() => setActiveTab('approved')}
                  className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
                    activeTab === 'approved'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  History ({approvedList.length})
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'drafts' && (
                  <PropertyDraftsList
                    properties={draftsList}
                    onEdit={handleEditProperty}
                    onDelete={handleDeleteProperty}
                    onSubmit={handleSubmitProperty}
                    isDraft={true}
                  />
                )}
                {activeTab === 'submitted' && (
                  <PropertyDraftsList
                    properties={submittedList}
                    onEdit={handleEditProperty}
                    onDelete={handleDeleteProperty}
                    onSubmit={handleSubmitProperty}
                    isDraft={false}
                  />
                )}
                {activeTab === 'approved' && (
                  <PropertyDraftsList
                    properties={approvedList}
                    onEdit={handleEditProperty}
                    onDelete={handleDeleteProperty}
                    onSubmit={handleSubmitProperty}
                    isDraft={false}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
