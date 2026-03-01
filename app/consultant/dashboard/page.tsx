"use client";

import { useEffect, useState, useMemo } from 'react';
import AssignedClients from '@/app/components/consultant/AssignedClients';
import ConsultationStatus from '@/app/components/consultant/ConsultationStatus';
import ConsultantNotes from '@/app/components/consultant/ConsultantNotes';
import RecommendedProjectsSection from '@/app/components/consultant/RecommendedProjectsSection';
import SiteVisitScheduling from '@/app/components/consultant/SiteVisitScheduling';
import DealProgressTracking from '@/app/components/consultant/DealProgressTracking';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { useAuth } from '@/app/contexts/AuthContext';

import { consultantService } from '@/app/services/consultantService';
import { leadNoteService } from '@/app/services/leadNoteService';

export default function ConsultantDashboard() {
  const { token } = useAuth();
  const { activeContext } = useUnifiedApp();
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clients' | 'status' | 'notes' | 'properties' | 'visits' | 'deals'>('properties');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [dbNotes, setDbNotes] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const props = await consultantService.getAssignedProjects(token);
        setAssignedProjects(props);

        // Fetch all notes for all leads if possible, or just skip for now and fetch per lead
        // For now, let's fetch notes for all leads in the assigned projects
        const leads = props.flatMap((p: any) => p.leads || []);
        const allDbNotes = await Promise.all(
          leads.map(async (lead: any) => {
            try {
              return await leadNoteService.getNotes(token, lead.id);
            } catch {
              return [];
            }
          })
        );
        setDbNotes(allDbNotes.flat());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  // Derive real data from assignedProjects
  const clients = useMemo(() => {
    const leads = assignedProjects.flatMap(p => p.leads || []);
    // Deduplicate leads by ID just in case
    const uniqueLeadsMap = new Map();
    leads.forEach(l => uniqueLeadsMap.set(l.id, l));
    const uniqueLeads = Array.from(uniqueLeadsMap.values());

    return uniqueLeads.map(lead => ({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      budget: 'TBD',
      location: lead.project?.location || 'N/A',
      status: (['CONVERTED', 'LOST'].includes(lead.status)) ? 'closed' as const :
        (lead.status === 'NEW' ? 'pending' : 'active') as 'active' | 'pending' | 'closed',
      assignedDate: new Date(lead.createdAt),
      profileImage: lead.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'L',
      projectId: lead.projectId,
      projectName: lead.project?.name,
    }));
  }, [assignedProjects]);

  const consultations = useMemo(() => {
    const leads = assignedProjects.flatMap(p => p.leads || []);
    const visits = leads.flatMap(l => (l.visits || []).map((v: any) => ({ ...v, leadId: l.id })));

    return visits.map(v => ({
      id: v.id,
      clientId: v.leadId,
      type: 'site-visit' as const,
      date: new Date(v.scheduledAt),
      notes: v.notes || 'No notes available',
      status: v.status === 'COMPLETED' ? 'completed' as const :
        v.status === 'CANCELLED' ? 'cancelled' as const : 'scheduled' as const,
      duration: 60,
    }));
  }, [assignedProjects]);

  const notes = useMemo(() => {
    const leads = assignedProjects.flatMap(p => p.leads || []);
    const leadNotes = leads.filter(l => l.notes).map(l => ({
      id: `lead-note-${l.id}`,
      clientId: l.id,
      content: l.notes,
      createdAt: new Date(l.updatedAt),
      category: 'general',
    }));

    const visitNotes = leads.flatMap(l => (l.visits || []).filter((v: any) => v.notes).map((v: any) => ({
      id: `visit-note-${v.id}`,
      clientId: l.id,
      content: v.notes,
      createdAt: new Date(v.updatedAt || v.scheduledAt),
      category: 'site-visit' as const,
    })));

    const formattedDbNotes = dbNotes.map(n => ({
      id: n.id,
      clientId: n.leadId,
      content: n.content,
      createdAt: new Date(n.createdAt),
      category: n.category.toLowerCase().replace('_', '-') as any,
    }));

    return [...leadNotes, ...visitNotes, ...formattedDbNotes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [assignedProjects, dbNotes]);

  const siteVisits = useMemo(() => {
    const leads = assignedProjects.flatMap(p => p.leads || []);
    const visits = leads.flatMap(l => (l.visits || []).map((v: any) => ({ ...v, leadId: l.id, projectId: l.projectId })));

    return visits.map(v => ({
      id: v.id,
      clientId: v.leadId,
      propertyId: v.projectId,
      scheduledDate: new Date(v.scheduledAt),
      status: v.status.toLowerCase(),
      feedback: v.notes || '',
    }));
  }, [assignedProjects]);

  const deals = useMemo(() => {
    const leads = assignedProjects.flatMap(p => p.leads || []);
    return leads.filter(l => ['NEGOTIATING', 'CONVERTED'].includes(l.status)).map(l => ({
      id: `deal-${l.id}`,
      clientId: l.id,
      propertyId: l.projectId,
      stage: (l.status === 'CONVERTED' ? 'closed' : 'negotiation') as 'closed' | 'negotiation',
      progress: l.status === 'CONVERTED' ? 100 : 75,
      createdAt: new Date(l.createdAt),
      updatedAt: new Date(l.updatedAt),
      notes: l.notes || '',
    }));
  }, [assignedProjects]);

  const properties = useMemo(() => {
    return assignedProjects.map(p => ({
      id: p.id,
      title: p.name,
      location: p.location,
      price: `₹${p.price}`,
      area: `${p.area} sqft`,
      config: `${p.bedrooms} BHK`,
      matchScore: 100,
      assignedToClients: (p.leads || []).map((l: any) => l.id),
    }));
  }, [assignedProjects]);

  const activeClients = clients.filter(c => c.status === 'active');

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
            <p className="text-gray-600 text-sm font-medium">Assigned Projects</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{assignedProjects.length}</p>
            <p className="text-xs text-gray-500 mt-2">Active assignments</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Campaigns</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {assignedProjects.reduce((acc, prop) => acc + (prop.campaigns?.length || 0), 0)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Marketing campaigns</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <p className="text-gray-600 text-sm font-medium">Total Leads</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {assignedProjects.reduce((acc, prop) => acc + (prop.leads?.length || 0), 0)}
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
              Assigned Projects
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === 'clients'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Follow-Ups
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
              <RecommendedProjectsSection projects={assignedProjects} />
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
                onAddNote={async (clientId: string, content: string, category: string) => {
                  if (!token) return;
                  try {
                    const newNote = await leadNoteService.addNote(token, clientId, content, category);
                    setDbNotes(prev => [newNote, ...prev]);
                    alert('Note saved successfully!');
                  } catch (error) {
                    console.error('Error adding note:', error);
                    alert('Failed to save note.');
                  }
                }}
              />
            )}
            {activeTab === 'visits' && (
              <SiteVisitScheduling
                siteVisits={siteVisits}
                properties={properties}
                clients={clients}
                onScheduleVisit={(clientId: any, propertyId: any, date: any, visitExecutiveId: any) => {
                  console.log('Schedule visit:', { clientId, propertyId, date, visitExecutiveId });
                  // In a real app, this would call an API
                  alert('Schedule visit functionality is read-only for now.');
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
