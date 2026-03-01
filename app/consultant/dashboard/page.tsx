"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
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

// ─── Call Modal ───────────────────────────────────────────────────────────────
function CallModal({ lead, onClose }: { lead: any; onClose: () => void }) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl w-80 p-8 flex flex-col items-center gap-6 text-white">
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-28 w-28 rounded-full bg-green-500/20 animate-ping" />
          <span className="absolute inline-flex h-22 w-22 rounded-full bg-green-500/30 animate-pulse" />
          <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-3xl font-bold shadow-lg">
            {(lead.name || 'L').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-1">Call in Progress</p>
          <h2 className="text-2xl font-bold">{lead.name || 'Lead'}</h2>
          <p className="text-slate-400 text-sm mt-0.5">{lead.phone || 'No phone'}</p>
        </div>
        <div className="bg-slate-700/50 rounded-2xl px-8 py-3 text-center">
          <p className="text-3xl font-mono font-semibold tracking-widest text-white">{fmt(seconds)}</p>
          <p className="text-slate-400 text-xs mt-1">Your phone rings first, then connects to the lead</p>
        </div>
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Phone</span><span className="text-white font-medium">{lead.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Location</span><span className="text-white font-medium">{lead.location || 'N/A'}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-2 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 active:scale-95 transition-all duration-150 rounded-full px-8 py-3 font-semibold text-white shadow-lg w-full"
        >
          <svg className="h-5 w-5 rotate-135" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.45 2.33.7 3.58.7a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.25 2.45.7 3.57a1 1 0 01-.24 1.01l-2.34 2.21z" />
          </svg>
          End / Dismiss
        </button>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ConsultantDashboard() {
  const { token } = useAuth();
  const { activeContext } = useUnifiedApp();
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clients' | 'status' | 'notes' | 'properties' | 'visits' | 'deals'>('properties');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [dbNotes, setDbNotes] = useState<any[]>([]);
  const [callingId, setCallingId] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<any | null>(null);
  const callInProgress = useRef(false); // prevents double-click / double-fire

  const handleCallLead = async (lead: any) => {
    if (!token || callInProgress.current) return; // block if already in flight
    callInProgress.current = true;
    setCallingId(lead.id);
    try {
      await consultantService.makeCall(token, lead.id);
      setActiveCall(lead);
    } catch (error: any) {
      console.error('Error initiating call:', error);
      alert(error.response?.data?.message || 'Failed to initiate call');
    } finally {
      setCallingId(null);
      callInProgress.current = false;
    }
  };

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
      {/* Call Modal */}
      {activeCall && <CallModal lead={activeCall} onClose={() => setActiveCall(null)} />}

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
                onCallClient={handleCallLead}
                callingId={callingId}
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
