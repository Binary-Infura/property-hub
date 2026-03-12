"use client";

import React, { useState, useEffect } from 'react';
import { consultantService } from '@/app/services/consultantService';
import { leadNoteService, LeadNote } from '@/app/services/leadNoteService';

interface LeadDetailsDrawerProps {
    lead: any;
    token: string;
    onClose: () => void;
    onStatusUpdate: (leadId: string, newStatus: string) => void;
}

export default function LeadDetailsDrawer({ lead, token, onClose, onStatusUpdate }: LeadDetailsDrawerProps) {
    const [activeTab, setActiveTab] = useState<'notes' | 'calls' | 'info' | 'activity'>('notes');
    const [notes, setNotes] = useState<LeadNote[]>([]);
    const [calls, setCalls] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [generatingLink, setGeneratingLink] = useState(false);
    const [videoLink, setVideoLink] = useState(lead?.videoCallRoom ? `${window.location.origin}/consultant/call/${lead.videoCallRoom}?leadName=${encodeURIComponent(lead.name || 'Guest')}` : '');
    const [newNote, setNewNote] = useState('');
    const [newCategory, setNewCategory] = useState('GENERAL');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [sendingLink, setSendingLink] = useState<'email' | 'whatsapp' | null>(null);

    useEffect(() => {
        if (!lead || !token) return;
        fetchData();
    }, [lead, token]);

    async function fetchData() {
        setLoading(true);
        try {
            const [fetchedNotes, fetchedCalls, fetchedActivities] = await Promise.all([
                leadNoteService.getNotes(token, lead.id),
                consultantService.getLeadCallLogs(token, lead.id),
                consultantService.getLeadActivities(token, lead.id)
            ]);
            setNotes(fetchedNotes);
            setCalls(fetchedCalls);
            setActivities(fetchedActivities);
        } catch (error) {
            console.error('Error fetching lead details:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        try {
            const note = await leadNoteService.addNote(token, lead.id, newNote, newCategory);
            setNotes([note, ...notes]);
            setNewNote('');
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Failed to add note');
        }
    };

    const handleStatusUpdate = async (status: string) => {
        setIsUpdatingStatus(true);
        try {
            await onStatusUpdate(lead.id, status);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleSendVideoLink = async (channel: 'email' | 'whatsapp') => {
        setSendingLink(channel);
        try {
            await consultantService.sendVideoCallLink(token, lead.id, channel);
            alert(`Video call link sent via ${channel} successfully!`);
            // Refresh activity
            const fetchedActivities = await consultantService.getLeadActivities(token, lead.id);
            setActivities(fetchedActivities);
        } catch (error) {
            console.error(`Error sending video link via ${channel}:`, error);
            alert(`Failed to send video link via ${channel}`);
        } finally {
            setSendingLink(null);
        }
    };

    const handleGenerateVideoRoom = async () => {
        setGeneratingLink(true);
        try {
            const result = await consultantService.generateVideoRoom(token, lead.id);
            setVideoLink(result.videoCallLink);
            // Refresh activity after generating
            const fetchedActivities = await consultantService.getLeadActivities(token, lead.id);
            setActivities(fetchedActivities);
            alert('Video room generated successfully!');
        } catch (error) {
            console.error('Error generating video room:', error);
            alert('Failed to generate video room');
        } finally {
            setGeneratingLink(false);
        }
    };

    const getStatusColor = (state: string) => {
        const s = (state || '').toUpperCase();
        if (s.includes('NEW')) return 'bg-blue-100 text-blue-800';
        if (s.includes('CONTACTED')) return 'bg-yellow-100 text-yellow-800';
        if (s.includes('FOLLOW_UP')) return 'bg-indigo-100 text-indigo-800';
        if (s.includes('VISITING')) return 'bg-purple-100 text-purple-800';
        if (s.includes('NEGOTIATING')) return 'bg-orange-100 text-orange-800';
        if (s.includes('CONVERTED')) return 'bg-green-100 text-green-800';
        if (s.includes('LOST')) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const LEAD_STATUSES = [
        'NEW', 'CONTACTED', 'FOLLOW_UP_STARTED', 'QUALIFIED', 'VISITING', 'NEGOTIATING', 'CONVERTED', 'LOST'
    ];

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:max-w-md lg:max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
            {/* Header */}
            <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl uppercase shadow-lg shadow-blue-200">
                        {lead.name?.[0] || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{lead.name || 'Unknown Lead'}</h2>
                        <p className="text-sm text-gray-500">{lead.phone || 'No phone'}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Quick Actions / Status */}
            <div className="px-6 py-4 bg-white border-b border-gray-100">
                <div className="flex flex-wrap gap-2">
                    {LEAD_STATUSES.map(stat => (
                        <button
                            key={stat}
                            onClick={() => handleStatusUpdate(stat)}
                            disabled={isUpdatingStatus}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${lead.status === stat
                                    ? `${getStatusColor(stat)} border-2 border-current shadow-sm`
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                                }`}
                        >
                            {stat.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'notes' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Timeline & Notes
                </button>
                <button
                    onClick={() => setActiveTab('calls')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'calls' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Calls
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'activity' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Activity
                </button>
                <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Details
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'notes' && (
                    <div className="space-y-6">
                        {/* New Note Form */}
                        <form onSubmit={handleAddNote} className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Write a note about this lead..."
                                className="w-full bg-white px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                rows={3}
                            />
                            <div className="flex items-center justify-between gap-3">
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-none"
                                >
                                    <option value="GENERAL">General</option>
                                    <option value="PREFERENCE">Preference</option>
                                    <option value="BUDGET">Budget</option>
                                    <option value="FOLLOW_UP">Follow Up</option>
                                </select>
                                <button type="submit" disabled={!newNote.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-colors">
                                    Add Note
                                </button>
                            </div>
                        </form>

                        {/* Notes List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-10 text-gray-400 animate-pulse">Loading notes...</div>
                            ) : notes.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 italic">No notes added for this lead yet.</div>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="relative pl-6 border-l-2 border-blue-100 space-y-2">
                                        <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-blue-600 ring-4 ring-white" />
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${getStatusColor(note.category)}`}>
                                                {note.category}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(note.createdAt)}</span>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                            <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'calls' && (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10 text-gray-400 animate-pulse">Syncing call history...</div>
                        ) : calls.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 italic">No call history found.</div>
                        ) : (
                            calls.map(call => (
                                <div key={call.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${call.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.45 2.33.7 3.58.7a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.25 2.45.7 3.57a1 1 0 01-.24 1.01l-2.34 2.21z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{call.status.toUpperCase()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{formatDate(call.createdAt)} • {call.duration || 0}s</p>
                                        </div>
                                    </div>
                                    {call.recordingUrl && (
                                        <a href={call.recordingUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </a>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
                {activeTab === 'info' && (
                    <div className="space-y-6">
                        <section>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Basic Information</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Email</span>
                                    <span className="text-sm font-bold text-gray-900">{lead.email || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Phone</span>
                                    <span className="text-sm font-bold text-gray-900">{lead.phone || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Created At</span>
                                    <span className="text-sm font-bold text-gray-900">{formatDate(lead.createdAt)}</span>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Project & Context</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Project</span>
                                    <span className="text-sm font-bold text-gray-900">{lead.projectName || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Campaign</span>
                                    <span className="text-sm font-bold text-gray-900">{lead.campaignName || 'Direct'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">Platform</span>
                                    <span className="text-sm font-bold text-gray-900">{lead.platform || 'N/A'}</span>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Video Consultation</h4>
                            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 space-y-3">
                                {videoLink ? (
                                    <>
                                        <div className="text-xs text-blue-800 font-medium">Existing Room Link:</div>
                                        <div className="bg-white p-2 rounded border border-blue-200 text-[10px] font-mono break-all text-blue-600">
                                            {videoLink}
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => window.open(videoLink, '_blank')}
                                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                            >
                                                Open Room
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(videoLink);
                                                    alert('Link copied to clipboard!');
                                                }}
                                                className="px-3 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <button 
                                                onClick={() => handleSendVideoLink('email')}
                                                disabled={sendingLink !== null}
                                                className="py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {sendingLink === 'email' ? 'Sending...' : 'Send Email'}
                                            </button>
                                            <button 
                                                onClick={() => handleSendVideoLink('whatsapp')}
                                                disabled={sendingLink !== null}
                                                className="py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {sendingLink === 'whatsapp' ? 'Sending...' : 'Send WhatsApp'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center space-y-3">
                                        <p className="text-xs text-blue-700 italic">No video room generated yet for this lead.</p>
                                        <button 
                                            onClick={handleGenerateVideoRoom}
                                            disabled={generatingLink}
                                            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-md shadow-blue-100"
                                        >
                                            {generatingLink ? 'Generating...' : 'Generate Video Room Link'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10 text-gray-400 animate-pulse">Loading activities...</div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 italic">No recent activity found.</div>
                        ) : (
                            <div className="space-y-6 relative">
                                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-100" />
                                {activities.map((activity, idx) => (
                                    <div key={activity.id || idx} className="relative pl-10">
                                        <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full bg-blue-500 ring-4 ring-white shadow-sm" />
                                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1 hover:border-blue-200 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <h5 className="text-sm font-bold text-gray-900">{activity.action}</h5>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(activity.timestamp)}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">By {activity.user?.firstName} {activity.user?.lastName}</p>
                                            {activity.details && typeof activity.details === 'object' && Object.keys(activity.details).length > 0 && (
                                                <div className="mt-2 text-[10px] bg-gray-50 p-2 rounded-lg text-gray-600 border border-gray-100">
                                                    {Object.entries(activity.details).map(([key, val]: [string, any]) => (
                                                        <div key={key} className="flex gap-2">
                                                            <span className="font-bold uppercase tracking-wider opacity-50">{key}:</span>
                                                            <span className="break-all">{String(val)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Backdrop-like close area if needed, but this is usually handled by parent. 
                For now we just provide the drawer content. */}
        </div>
    );
}
