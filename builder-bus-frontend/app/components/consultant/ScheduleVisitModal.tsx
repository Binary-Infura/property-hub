'use client';

import { useState, useEffect } from 'react';
import { consultantService } from '@/app/services/consultantService';

interface Lead {
  id: string;
  name: string;
  projectId: string;
  projectName?: string;
}

interface VisitExecutive {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  leads: Lead[];
  onSuccess: () => void;
  editVisit?: any;
}

export default function ScheduleVisitModal({ isOpen, onClose, token, leads, onSuccess, editVisit }: ScheduleVisitModalProps) {
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [selectedExecutiveId, setSelectedExecutiveId] = useState('');
  const [notes, setNotes] = useState('');
  const [executives, setExecutives] = useState<VisitExecutive[]>([]);
  const [loadingExecs, setLoadingExecs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editVisit) {
        setSelectedLeadId(editVisit.leadId);
        const date = new Date(editVisit.scheduledAt);
        setVisitDate(date.toISOString().split('T')[0]);
        setVisitTime(date.toTimeString().substring(0, 5));
        setSelectedExecutiveId(editVisit.visitExecutiveId || '');
        setNotes(editVisit.notes || '');
      } else {
        setSelectedLeadId('');
        setVisitDate('');
        setVisitTime('');
        setSelectedExecutiveId('');
        setNotes('');
      }
    }
  }, [isOpen, editVisit]);

  useEffect(() => {
    if (selectedLeadId) {
      const lead = leads.find(l => l.id === selectedLeadId);
      if (lead?.projectId) {
        fetchExecutives(lead.projectId);
      } else {
        setExecutives([]);
      }
    } else {
      setExecutives([]);
    }
  }, [selectedLeadId]);

  const fetchExecutives = async (projectId: string) => {
    setLoadingExecs(true);
    try {
      const data = await consultantService.getExecutivesForProject(token, projectId);
      setExecutives(data);
    } catch (error) {
      console.error('Error fetching executives:', error);
    } finally {
      setLoadingExecs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !visitDate || !visitTime) return;

    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${visitDate}T${visitTime}`).toISOString();
      if (editVisit) {
        await consultantService.updateVisit(token, editVisit.id, {
          scheduledAt,
          visitExecutiveId: selectedExecutiveId || undefined,
          notes: notes || undefined,
        });
      } else {
        await consultantService.scheduleVisit(token, {
          leadId: selectedLeadId,
          scheduledAt,
          visitExecutiveId: selectedExecutiveId || undefined,
          notes: notes || undefined,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving visit:', error);
      alert('Failed to save visit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{editVisit ? 'Reschedule Visit' : 'Schedule Site Visit'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Client <span className="text-red-500">*</span></label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              required
              disabled={!!editVisit}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white disabled:bg-gray-50"
            >
              <option value="">Choose a client...</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} {lead.projectName ? `(${lead.projectName})` : ''}
                </option>
              ))}
            </select>
            {editVisit && <p className="text-[10px] text-gray-400 mt-1">Client cannot be changed during rescheduling</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Visit Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Visit Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Assign Visit Executive
              {loadingExecs && <span className="ml-2 text-xs text-blue-500 animate-pulse">(Loading...)</span>}
            </label>
            <select
              value={selectedExecutiveId}
              onChange={(e) => setSelectedExecutiveId(e.target.value)}
              disabled={!selectedLeadId || loadingExecs}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Select an executive (Optional)</option>
              {executives.map(exec => (
                <option key={exec.id} value={exec.id}>
                  {exec.firstName} {exec.lastName}
                </option>
              ))}
              {!loadingExecs && selectedLeadId && executives.length === 0 && (
                <option disabled>No executives allocated to this project</option>
              )}
            </select>
            {!selectedLeadId && <p className="text-[10px] text-gray-400 mt-1">Select a client first to see available executives</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific instructions for the visit..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white h-24 resize-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedLeadId || !visitDate || !visitTime}
              className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-md shadow-blue-200 active:scale-[0.98]"
            >
              {submitting ? 'Saving...' : (editVisit ? 'Update Visit' : 'Schedule Visit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
