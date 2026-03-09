"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { consultantService } from '@/app/services/consultantService';
import VideoCallModal from '@/app/components/consultant/VideoCallModal';
import LeadDetailsDrawer from '@/app/components/consultant/LeadDetailsDrawer';

// ─── Call Modal ───────────────────────────────────────────────────────────────
interface CallModalProps {
    lead: any;
    onClose: () => void;
}

function CallModal({ lead, onClose }: CallModalProps) {
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
                {/* Pulsing avatar */}
                <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-28 w-28 rounded-full bg-green-500/20 animate-ping" />
                    <span className="absolute inline-flex h-22 w-22 rounded-full bg-green-500/30 animate-pulse" />
                    <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                        {(lead.name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                </div>

                {/* Lead info */}
                <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-1">Call in Progress</p>
                    <h2 className="text-2xl font-bold">{lead.name || 'Unknown'}</h2>
                    <p className="text-slate-400 text-sm mt-0.5">{lead.phone || 'No phone'}</p>
                </div>

                {/* Timer */}
                <div className="bg-slate-700/50 rounded-2xl px-8 py-3 text-center">
                    <p className="text-3xl font-mono font-semibold tracking-widest text-white">{fmt(seconds)}</p>
                    <p className="text-slate-400 text-xs mt-1">Your phone will ring first, then connects to the lead</p>
                </div>

                {/* Call details */}
                <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Project</span>
                        <span className="text-white font-medium">{lead.projectName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Campaign</span>
                        <span className="text-white font-medium">{lead.campaignName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Status</span>
                        <span className="text-green-400 font-medium">{lead.status || 'NEW'}</span>
                    </div>
                </div>

                {/* Hang up */}
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

export default function LeadsPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);

    const [leads, setLeads] = useState<any[]>([]);

    // Filter lists
    const [projectsList, setProjectsList] = useState<string[]>(['All']);
    const [campaignsList, setCampaignsList] = useState<string[]>(['All']);
    const [platformsList, setPlatformsList] = useState<string[]>(['All']);
    const [leadStatesList, setLeadStatesList] = useState<string[]>(['All']);

    // Mapping of project name -> set of campaign names
    const [projectCampaignsMap, setProjectCampaignsMap] = useState<Record<string, Set<string>>>({});
    const [allCampaigns, setAllCampaigns] = useState<string[]>([]);

    // Selected filters
    const [selectedProject, setSelectedProject] = useState('All');
    const [selectedCampaign, setSelectedCampaign] = useState('All');
    const [selectedPlatform, setSelectedPlatform] = useState('All');
    const [selectedState, setSelectedState] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [callingId, setCallingId] = useState<string | null>(null);
    const [activeCall, setActiveCall] = useState<any | null>(null); // lead object for modal
    const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<any | null>(null);
    const [selectedLeadForVideo, setSelectedLeadForVideo] = useState<any | null>(null);
    const [sendingLinkId, setSendingLinkId] = useState<string | null>(null);
    const [sendingChannel, setSendingChannel] = useState<'email' | 'whatsapp' | null>(null);

    useEffect(() => {
        async function fetchData() {
            if (!token) return;
            try {
                const props = await consultantService.getAssignedProjects(token);

                let allLeads: any[] = [];
                let projectsSet = new Set<string>();
                let campaignsSet = new Set<string>();
                let platformsSet = new Set<string>();
                let statusSet = new Set<string>();
                let projectMap: Record<string, Set<string>> = {};

                props.forEach((project: any) => {
                    const projectName: string = project.name || 'Unknown';
                    if (project.name) projectsSet.add(project.name);

                    if (!projectMap[projectName]) projectMap[projectName] = new Set();

                    // Process leads directly assigned to project
                    project.leads?.forEach((lead: any) => {
                        if (lead.status) statusSet.add(lead.status);

                        // Link campaign info if it exists
                        const campaign = project.campaigns?.find((c: any) => c.id === lead.campaignId);
                        if (campaign && campaign.name) {
                            campaignsSet.add(campaign.name);
                            projectMap[projectName].add(campaign.name);
                        }

                        allLeads.push({
                            ...lead,
                            projectName: projectName,
                            campaignName: campaign?.name || 'Direct',
                            platform: campaign?.platform || 'Direct',
                        });
                    });
                });

                setProjectCampaignsMap(projectMap);
                setAllCampaigns(['All', ...Array.from(campaignsSet).sort()]);

                const ALL_LEAD_STATUSES = [
                    'NEW',
                    'CONTACTED',
                    'FOLLOW_UP_STARTED',
                    'QUALIFIED',
                    'VISITING',
                    'NEGOTIATING',
                    'CONVERTED',
                    'LOST'
                ];

                const ALL_PLATFORMS = [
                    'Google Ads',
                    'Facebook',
                    'Instagram',
                    'LinkedIn',
                    'Twitter',
                    'Direct',
                    'Organic'
                ];

                setLeads(allLeads);
                setProjectsList(['All', ...Array.from(projectsSet).sort()]);
                setCampaignsList(['All', ...Array.from(campaignsSet).sort()]);
                setPlatformsList(['All', ...ALL_PLATFORMS]);
                setLeadStatesList(['All', ...ALL_LEAD_STATUSES]);
            } catch (error) {
                console.error('Error fetching consultant leads:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [token]);

    // Update campaigns list when project changes
    useEffect(() => {
        if (selectedProject === 'All') {
            setCampaignsList(allCampaigns);
        } else {
            const campaigns = projectCampaignsMap[selectedProject]
                ? ['All', ...Array.from(projectCampaignsMap[selectedProject]).sort()]
                : ['All'];
            setCampaignsList(campaigns);
        }
        setSelectedCampaign('All'); // Reset campaign filter when project changes
    }, [selectedProject, projectCampaignsMap, allCampaigns]);

    const handleUpdateStatus = async (leadId: string, newStatus: string) => {
        if (!token) return;
        try {
            await consultantService.updateLeadStatus(token, leadId, newStatus);
            // Update local state for the list
            setLeads(prevLeads => prevLeads.map(lead =>
                lead.id === leadId ? { ...lead, status: newStatus } : lead
            ));
            // Update selected lead if it's the one being modified
            if (selectedLeadForDetails?.id === leadId) {
                setSelectedLeadForDetails((prev: any) => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            console.error('Error updating lead status:', error);
            alert('Failed to update status');
        }
    };

    const callInProgress = useRef(false);

    const handleCallLead = async (lead: any) => {
        if (!token || callInProgress.current) return;
        callInProgress.current = true;
        setCallingId(lead.id);
        try {
            const result = await consultantService.makeCall(token, lead.id);
            console.log('Call initiated:', result);
            setActiveCall(lead); // Show call modal
        } catch (error: any) {
            console.error('Error initiating call:', error);
            const errorMessage = error.response?.data?.message || 
                                 error.response?.data?.error || 
                                 error.message || 
                                 'Failed to initiate call. Please check your profile settings and try again.';
            alert(`Call Failed: ${errorMessage}`);
        } finally {
            setCallingId(null);
            callInProgress.current = false;
        }
    };

    const handleSendVideoLink = async (lead: any, channel: 'email' | 'whatsapp') => {
        if (!token) return;
        setSendingLinkId(lead.id);
        setSendingChannel(channel);
        try {
            const result = await consultantService.sendVideoCallLink(token, lead.id, channel);
            console.log('Video link sent:', result);
            alert(`Video call link sent successfully via ${channel}!`);
        } catch (error: any) {
            console.error('Error sending video link:', error);
            const errorMessage = error.response?.data?.message || 
                                 error.response?.data?.error || 
                                 error.message || 
                                 `Failed to send video link via ${channel}`;
            alert(`Error: ${errorMessage}`);
        } finally {
            setSendingLinkId(null);
            setSendingChannel(null);
        }
    };

    // Filter leads based on selected criteria
    const filteredLeads = leads.filter(lead => {
        const matchesProject = selectedProject === 'All' || lead.projectName === selectedProject;
        const matchesCampaign = selectedCampaign === 'All' || lead.campaignName === selectedCampaign;
        const matchesPlatform = selectedPlatform === 'All' || lead.platform === selectedPlatform;
        const matchesState = selectedState === 'All' || lead.status === selectedState;

        const q = searchQuery.toLowerCase();
        const matchesSearch =
            (lead.name && lead.name.toLowerCase().includes(q)) ||
            (lead.email && lead.email.toLowerCase().includes(q)) ||
            (lead.phone && lead.phone.includes(q));

        return matchesProject && matchesCampaign && matchesPlatform && matchesState && matchesSearch;
    });

    const getStatusColor = (state: string) => {
        const s = (state || '').toUpperCase();
        if (s.includes('NEW')) return 'bg-blue-100 text-blue-800';
        if (s.includes('CONTACTED')) return 'bg-yellow-100 text-yellow-800';
        if (s.includes('FOLLOW_UP_STARTED') || s.includes('FOLLOW-UP')) return 'bg-indigo-100 text-indigo-800';
        if (s.includes('VISIT') || s.includes('SCHEDULED')) return 'bg-purple-100 text-purple-800';
        if (s.includes('NEGOTIATING')) return 'bg-orange-100 text-orange-800';
        if (s.includes('WON') || s.includes('CLOSED')) return 'bg-green-100 text-green-800';
        if (s.includes('LOST')) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Call Modal */}
            {activeCall && <CallModal lead={activeCall} onClose={() => setActiveCall(null)} />}

            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
                    <p className="text-gray-600 mt-1">Track and manage your property leads</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-5 lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search Leads</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Search name, email, phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                            <select
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                            >
                                {projectsList.map(project => (
                                    <option key={project} value={project}>{project}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign</label>
                            <select
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                                value={selectedCampaign}
                                onChange={(e) => setSelectedCampaign(e.target.value)}
                            >
                                {campaignsList.map(campaign => (
                                    <option key={campaign} value={campaign}>{campaign}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                            <select
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                                value={selectedPlatform}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                            >
                                {platformsList.map(platform => (
                                    <option key={platform} value={platform}>{platform}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                            >
                                {leadStatesList.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead Info</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign & Platform</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action Date</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLeads.length > 0 ? (
                                    filteredLeads.map((lead, idx) => (
                                        <tr key={lead.id || idx} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedLeadForDetails(lead)}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                                        {(lead.name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{lead.name || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-500">{lead.email || 'N/A'}</div>
                                                        <div className="text-sm text-gray-400">{lead.phone || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{lead.projectName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">{lead.campaignName}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{lead.platform}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${getStatusColor(lead.status)}`}>
                                                    {lead.status || 'NEW'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleCallLead(lead)}
                                                        disabled={callingId === lead.id}
                                                        title={lead.phone ? `Call ${lead.phone}` : 'No phone number'}
                                                        className={`p-2 rounded-lg ${callingId === lead.id
                                                            ? 'bg-gray-100 text-gray-400'
                                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                            } transition-colors`}
                                                    >
                                                        {callingId === lead.id ? (
                                                            <span className="inline-block h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.45 2.33.7 3.58.7a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.25 2.45.7 3.57a1 1 0 01-.24 1.01l-2.34 2.21z" /></svg>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            const roomName = `room-${lead.id}`;
                                                            const leadName = encodeURIComponent(lead.name || 'User');
                                                            window.open(`/consultant/call/${roomName}?leadName=${leadName}`, '_blank', 'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no');
                                                        }}
                                                        title="Video Call"
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() => handleSendVideoLink(lead, 'email')}
                                                        disabled={sendingLinkId === lead.id && sendingChannel === 'email'}
                                                        title={lead.email ? `Send via email` : 'No email address'}
                                                        className={`p-2 rounded-lg ${sendingLinkId === lead.id && sendingChannel === 'email'
                                                            ? 'bg-gray-100 text-gray-400'
                                                            : lead.email ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-gray-50 text-gray-400'
                                                            } transition-colors`}
                                                    >
                                                        {sendingLinkId === lead.id && sendingChannel === 'email' ? (
                                                            <span className="inline-block h-4 w-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => handleSendVideoLink(lead, 'whatsapp')}
                                                        disabled={sendingLinkId === lead.id && sendingChannel === 'whatsapp'}
                                                        title={lead.phone ? `Send via WhatsApp` : 'No phone number'}
                                                        className={`p-2 rounded-lg ${sendingLinkId === lead.id && sendingChannel === 'whatsapp'
                                                            ? 'bg-gray-100 text-gray-400'
                                                            : lead.phone ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-400'
                                                            } transition-colors`}
                                                    >
                                                        {sendingLinkId === lead.id && sendingChannel === 'whatsapp' ? (
                                                            <span className="inline-block h-4 w-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.6 6.32c-1.63-1.6-3.8-2.48-6.1-2.48-4.76 0-8.63 3.87-8.63 8.63 0 1.52.39 3 1.15 4.31L2.7 19.87l4.72-1.24c1.27.68 2.69 1.04 4.14 1.04h.01c4.76 0 8.63-3.87 8.63-8.63 0-2.3-.9-4.47-2.51-6.1zm-6.1 13.69c-1.29 0-2.56-.33-3.68-.97l-.26-.16-2.71.71.72-2.63-.17-.27c-.71-1.13-1.09-2.43-1.09-3.76 0-3.96 3.22-7.18 7.18-7.18 1.91 0 3.71.77 5.06 2.11 1.35 1.35 2.11 3.15 2.11 5.06 0 3.96-3.22 7.18-7.18 7.18zm3.94-5.39c-.22-.11-1.29-.64-1.49-.71-.2-.07-.34-.11-.49.11-.14.22-.57.71-.7.86-.13.15-.26.17-.48.05-.22-.11-.92-.34-1.75-1.08-.65-.58-1.09-1.29-1.22-1.51-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.14-.22.22-.37.07-.15.04-.28-.02-.39-.07-.11-.49-1.18-.67-1.61-.18-.41-.36-.36-.49-.36-.13 0-.28-.02-.42-.02-.15 0-.39.06-.59.28-.2.22-.76.74-.76 1.81 0 1.07.78 2.1.89 2.25.11.15 1.54 2.35 3.73 3.3 2.2.95 2.2.63 2.6.59.4-.04 1.29-.53 1.47-1.04.18-.51.18-.95.12-1.04-.05-.09-.2-.14-.42-.25z" /></svg>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedLeadForDetails(lead)}
                                                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <p className="text-lg font-medium text-gray-900">No leads found</p>
                                            <p className="mt-1">Try adjusting your filters or search query.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{filteredLeads.length > 0 ? 1 : 0}</span> to <span className="font-medium">{filteredLeads.length}</span> of <span className="font-medium">{filteredLeads.length}</span> results
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop for Lead Details Drawer */}
            {selectedLeadForDetails && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[40] transition-opacity duration-300"
                    onClick={() => setSelectedLeadForDetails(null)}
                />
            )}

            {/* Lead Details Drawer */}
            {selectedLeadForDetails && (
                <LeadDetailsDrawer
                    lead={selectedLeadForDetails}
                    token={token || ''}
                    onClose={() => setSelectedLeadForDetails(null)}
                    onStatusUpdate={handleUpdateStatus}
                />
            )}

            {/* Video Call Modal */}
            {selectedLeadForVideo && (
                <VideoCallModal
                    token={token || ''}
                    roomName={`lead-${selectedLeadForVideo.id}`}
                    leadName={selectedLeadForVideo.name || 'User'}
                    onClose={() => setSelectedLeadForVideo(null)}
                />
            )}
        </div>
    );
}
