'use client';

import { useState } from 'react';
import AssignedClients from '@/app/components/consultant/AssignedClients';
import ConsultationStatus from '@/app/components/consultant/ConsultationStatus';
import ConsultantNotes from '@/app/components/consultant/ConsultantNotes';
import RecommendedPropertiesSection from '@/app/components/consultant/RecommendedPropertiesSection';
import SiteVisitScheduling from '@/app/components/consultant/SiteVisitScheduling';
import DealProgressTracking from '@/app/components/consultant/DealProgressTracking';

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  budget: string;
  location: string;
  status: 'active' | 'pending' | 'closed';
  assignedDate: Date;
  profileImage: string;
}

interface ConsultationRecord {
  id: string;
  clientId: string;
  type: 'initial' | 'follow-up' | 'site-visit' | 'negotiation';
  date: Date;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  duration: number;
}

interface Note {
  id: string;
  clientId: string;
  content: string;
  createdAt: Date;
  category: 'general' | 'preference' | 'budget' | 'legal' | 'follow-up';
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  area: string;
  config: string;
  matchScore: number;
  assignedToClients: string[];
}

interface SiteVisit {
  id: string;
  clientId: string;
  propertyId: string;
  scheduledDate: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: string;
}

interface Deal {
  id: string;
  clientId: string;
  propertyId: string;
  stage: 'inquiry' | 'site-visit' | 'offer' | 'negotiation' | 'documentation' | 'closed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  notes: string;
}

export default function ConsultantDashboard() {
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@email.com',
      budget: '₹50L - ₹75L',
      location: 'Mumbai (Central)',
      status: 'active',
      assignedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      profileImage: 'RK',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      phone: '+91 97654 32109',
      email: 'priya.sharma@email.com',
      budget: '₹80L - ₹120L',
      location: 'Mumbai (South)',
      status: 'active',
      assignedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      profileImage: 'PS',
    },
    {
      id: '3',
      name: 'Arun Patel',
      phone: '+91 96543 21098',
      email: 'arun.patel@email.com',
      budget: '₹1.5Cr+',
      location: 'Mumbai (North)',
      status: 'pending',
      assignedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      profileImage: 'AP',
    },
  ]);

  const [consultations, setConsultations] = useState<ConsultationRecord[]>([
    {
      id: '1',
      clientId: '1',
      type: 'initial',
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      notes: 'Client is looking for 3BHK with modern amenities. Prefers central Mumbai locations.',
      status: 'completed',
      duration: 45,
    },
    {
      id: '2',
      clientId: '2',
      type: 'site-visit',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Visit to property in Bandra',
      status: 'scheduled',
      duration: 60,
    },
    {
      id: '3',
      clientId: '1',
      type: 'follow-up',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Check on property preferences',
      status: 'scheduled',
      duration: 30,
    },
  ]);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      clientId: '1',
      content: 'Client mentioned interest in properties with gym and swimming pool.',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      category: 'preference',
    },
    {
      id: '2',
      clientId: '1',
      content: 'Budget increased to ₹75L after family discussion.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      category: 'budget',
    },
    {
      id: '3',
      clientId: '2',
      content: 'Awaiting loan approval letter from bank.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      category: 'legal',
    },
  ]);

  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      title: 'Sunset Towers, Bandra',
      location: 'Bandra, Mumbai',
      price: '₹85L',
      area: '1800 sqft',
      config: '3 BHK',
      matchScore: 92,
      assignedToClients: ['1', '2'],
    },
    {
      id: '2',
      title: 'Green Valley Homes, Powai',
      location: 'Powai, Mumbai',
      price: '₹52L',
      area: '1200 sqft',
      config: '2 BHK',
      matchScore: 85,
      assignedToClients: ['1'],
    },
    {
      id: '3',
      title: 'Luxury Heights, Worli',
      location: 'Worli, Mumbai',
      price: '₹1.2Cr',
      area: '2500 sqft',
      config: '4 BHK',
      matchScore: 88,
      assignedToClients: ['3'],
    },
  ]);

  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([
    {
      id: '1',
      clientId: '2',
      propertyId: '1',
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'scheduled',
    },
    {
      id: '2',
      clientId: '1',
      propertyId: '2',
      scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'completed',
      feedback: 'Client liked the location but mentioned the area feels cramped.',
    },
  ]);

  const [deals, setDeals] = useState<Deal[]>([
    {
      id: '1',
      clientId: '1',
      propertyId: '2',
      stage: 'site-visit',
      progress: 40,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: 'Site visit completed, client considering this property.',
    },
    {
      id: '2',
      clientId: '2',
      propertyId: '1',
      stage: 'offer',
      progress: 60,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notes: 'Offer made, awaiting builder response.',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'clients' | 'status' | 'notes' | 'properties' | 'visits' | 'deals'>('clients');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const activeClients = clients.filter(c => c.status === 'active');
  const pendingClients = clients.filter(c => c.status === 'pending');
  const closedDeals = deals.filter(d => d.stage === 'closed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultant Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage clients, consultations, and property matches</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Active Clients</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{activeClients.length}</p>
            <p className="text-xs text-gray-500 mt-2">Under consultation</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Pending Clients</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingClients.length}</p>
            <p className="text-xs text-gray-500 mt-2">Awaiting initial consultation</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Open Deals</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{deals.filter(d => d.stage !== 'closed').length}</p>
            <p className="text-xs text-gray-500 mt-2">In progress</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Closed Deals</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{closedDeals.length}</p>
            <p className="text-xs text-gray-500 mt-2">Successfully closed</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Site Visits</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {siteVisits.filter(sv => sv.status === 'scheduled' || sv.status === 'completed').length}
            </p>
            <p className="text-xs text-gray-500 mt-2">Scheduled & completed</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === 'clients'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Assigned Clients
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === 'status'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Consultation Status
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === 'properties'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === 'visits'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Site Visits
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === 'deals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Deal Progress
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'clients' && (
              <AssignedClients
                clients={clients}
                onSelectClient={setSelectedClientId}
                selectedClientId={selectedClientId}
              />
            )}
            {activeTab === 'status' && (
              <ConsultationStatus consultations={consultations} clients={clients} />
            )}
            {activeTab === 'notes' && (
              <ConsultantNotes
                notes={notes}
                clients={clients}
                selectedClientId={selectedClientId}
                onAddNote={(clientId, content, category) => {
                  setNotes([
                    ...notes,
                    {
                      id: Date.now().toString(),
                      clientId,
                      content,
                      createdAt: new Date(),
                      category: category as Note['category'],
                    },
                  ]);
                }}
              />
            )}
            {activeTab === 'properties' && (
              <RecommendedPropertiesSection properties={properties} clients={clients} />
            )}
            {activeTab === 'visits' && (
              <SiteVisitScheduling
                siteVisits={siteVisits}
                properties={properties}
                clients={clients}
                onScheduleVisit={(clientId, propertyId, date) => {
                  setSiteVisits([
                    ...siteVisits,
                    {
                      id: Date.now().toString(),
                      clientId,
                      propertyId,
                      scheduledDate: date,
                      status: 'scheduled',
                    },
                  ]);
                }}
              />
            )}
            {activeTab === 'deals' && (
              <DealProgressTracking deals={deals} properties={properties} clients={clients} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

