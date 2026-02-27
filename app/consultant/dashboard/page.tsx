"use client";

import { useEffect, useState } from 'react';
import AssignedClients from '@/app/components/consultant/AssignedClients';
import ConsultationStatus from '@/app/components/consultant/ConsultationStatus';
import ConsultantNotes from '@/app/components/consultant/ConsultantNotes';
import RecommendedPropertiesSection from '@/app/components/consultant/RecommendedPropertiesSection';
import SiteVisitScheduling from '@/app/components/consultant/SiteVisitScheduling';
import DealProgressTracking from '@/app/components/consultant/DealProgressTracking';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { useAuth } from '@/app/contexts/AuthContext';
import NoAllocationPlaceholder from '@/app/components/dashboard/NoAllocationPlaceholder';
import { consultantService } from '@/app/services/consultantService';

export default function ConsultantDashboard() {
  const { token } = useAuth();
  const { activeContext } = useUnifiedApp();
  const [assignedProperties, setAssignedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep existing mock data for other sections for now
  const [clients, setClients] = useState<any[]>([
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

  const [consultations, setConsultations] = useState<any[]>([
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

  const [notes, setNotes] = useState<any[]>([
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

  const [siteVisits, setSiteVisits] = useState<any[]>([
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

  const [deals, setDeals] = useState<any[]>([
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

  const [properties, setProperties] = useState<any[]>([
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


  const [activeTab, setActiveTab] = useState<'clients' | 'status' | 'notes' | 'properties' | 'visits' | 'deals'>('properties'); // Default to properties as requested
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const props = await consultantService.getAssignedProperties(token);
        setAssignedProperties(props);
      } catch (error) {
        console.error('Error fetching consultant properties:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const activeClients = clients.filter(c => c.status === 'active');
  const pendingClients = clients.filter(c => c.status === 'pending');
  const closedDeals = deals.filter(d => d.stage === 'closed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultant Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage assigned properties, campaigns, and leads</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Assigned Properties</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{assignedProperties.length}</p>
            <p className="text-xs text-gray-500 mt-2">Active assignments</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Campaigns</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {assignedProperties.reduce((acc, prop) => acc + (prop.campaigns?.length || 0), 0)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Marketing campaigns</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Leads</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {assignedProperties.reduce((acc, prop) => acc + (prop.campaigns?.reduce((cAcc: any, camp: any) => cAcc + camp.leads.length, 0) || 0), 0)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Leads from campaigns</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Active Clients</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{activeClients.length}</p>
            <p className="text-xs text-gray-500 mt-2">Under consultation</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'properties'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Assigned Properties
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'clients'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Assigned Clients
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'status'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Consultation Status
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'visits'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Site Visits
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'deals'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Deal Progress
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'properties' && (
              <RecommendedPropertiesSection properties={assignedProperties} />
            )}
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
                onAddNote={(clientId: any, content: any, category: any) => {
                  setNotes([
                    ...notes,
                    {
                      id: Date.now().toString(),
                      clientId,
                      content,
                      createdAt: new Date(),
                      category,
                    },
                  ]);
                }}
              />
            )}
            {activeTab === 'visits' && (
              <SiteVisitScheduling
                siteVisits={siteVisits}
                properties={properties}
                clients={clients}
                onScheduleVisit={(clientId: any, propertyId: any, date: any, visitExecutiveId: any) => {
                  setSiteVisits([
                    ...siteVisits,
                    {
                      id: Date.now().toString(),
                      clientId,
                      propertyId,
                      scheduledDate: date,
                      status: 'scheduled',
                      visitExecutiveId,
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

