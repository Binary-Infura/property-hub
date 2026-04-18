'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { organizationService } from '@/app/services/organizationService';
import { marketingService } from '@/app/services/marketingService';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

export default function LeadsPage() {
    const { token } = useAuth();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Manual Lead Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        projectId: '',
        source: 'Manual',
        notes: ''
    });

    const [properties, setProperties] = useState<any[]>([]);
    const [brokers, setBrokers] = useState<any[]>([]);
    const [selectedBroker, setSelectedBroker] = useState<string>('');

    useEffect(() => {
        fetchLeads();
        if (token) {
            marketingService.getProperties(token).then(setProperties);
            // Fetch brokers directly from the property-partners endpoint
            fetch(`${API_URL}/api/property-partners/brokers`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(r => r.json())
            .then(data => {
                setBrokers(data);
            })
            .catch(err => console.error("Error fetching brokers for PP:", err));
        }
    }, [token]);



    const fetchLeads = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/leads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLeads(data);
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        setSubmitting(true);
        try {
            let sourceLabel = formData.source;
            if (selectedBroker) {
                const broker = brokers.find(b => b.id === selectedBroker);
                sourceLabel = `Broker: ${broker?.firstName} ${broker?.lastName}`;
            }

            await marketingService.createLead(token, {
                ...formData,
                source: sourceLabel,
                projectId: formData.projectId || undefined,
            });

            setShowCreateModal(false);
            setFormData({
                name: '',
                phone: '',
                email: '',
                projectId: '',
                source: 'Manual',
                notes: ''
            });
            setSelectedBroker('');

            fetchLeads();
        } catch (error) {
            console.error('Error creating lead:', error);
            alert('Error creating lead');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        const s = status?.toUpperCase() || '';
        if (s === 'NEW') return 'bg-blue-50 text-blue-700 border-blue-200';
        if (s === 'QUALIFIED') return 'bg-purple-50 text-purple-700 border-purple-200';
        if (s === 'CONVERTED') return 'bg-green-50 text-green-700 border-green-200';
        if (s === 'LOST') return 'bg-red-50 text-red-700 border-red-200';
        return 'bg-gray-50 text-gray-700 border-gray-200';
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Buyer Leads Central</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage and nurture your property prospects.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        Add Manual Buyer Lead
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Prospect Details</th>
                                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Project</th>
                                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pipeline Status</th>
                                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Onboarded</th>
                                <th scope="col" className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50">
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                                        No active buyer leads in your hub yet.
                                    </td>
                                </tr>
                            ) : leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center text-indigo-700 font-black text-lg shadow-sm group-hover:scale-110 transition-transform">
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-black text-slate-900">{lead.name}</div>
                                                <div className="text-xs text-slate-400 font-medium">{lead.email || lead.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-800">
                                            {lead.project?.name || lead.propertyName || <span className="text-slate-300">General</span>}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                                            {lead.source || 'Direct Inquiry'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 inline-flex text-[10px] font-black tracking-widest uppercase rounded-xl border ${getStatusColor(lead.status)}`}>
                                            {lead.status || 'NEW'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-500 font-medium">
                                        {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                                        <Link 
                                            href={`/property-partner/leads/${lead.id}`}
                                            className="text-indigo-600 hover:text-indigo-800 font-black uppercase tracking-widest text-xs"
                                        >
                                            Inspect
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Manual Lead Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Add New Buyer Lead</h2>
                                <p className="text-slate-500 mt-1 font-medium italic">Inject a new prospect into the sales engine</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-all hover:rotate-90">
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateLead} className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Prospect Identity</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                        placeholder="Full Name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">WhatsApp / Phone</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                            placeholder="+91"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                            placeholder="prospect@mail.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Interested Project</label>
                                    <div className="relative">
                                        <select
                                            value={formData.projectId}
                                            onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                                            className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.2rem_1.2rem] bg-[right_1.5rem_center] bg-no-repeat"
                                        >
                                            <option value="">Select Property</option>
                                            {properties.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 space-y-4 shadow-inner">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Broker Referral</h3>
                                            <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Attribute this lead to a partner</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-2 ml-1 opacity-60 px-1">Select Professional</label>
                                        <div className="relative">
                                            <select
                                                value={selectedBroker}
                                                onChange={(e) => setSelectedBroker(e.target.value)}
                                                className="w-full pl-6 pr-12 py-4 bg-white border border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-bold text-slate-800 shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236366f1%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.5rem_center] bg-no-repeat"
                                            >
                                                <option value="">No Referral (Direct)</option>
                                                {brokers.map(u => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.firstName} {u.lastName} {u.organization?.name ? `(${u.organization.name})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Discovery Notes</label>
                                    <textarea
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 resize-none placeholder:text-slate-300"
                                        placeholder="Add any specific requirements..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 disabled:opacity-50 shadow-2xl shadow-indigo-100 transition-all transform active:scale-95"
                                >
                                    {submitting ? 'Creating...' : 'Inject Buyer Lead'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
