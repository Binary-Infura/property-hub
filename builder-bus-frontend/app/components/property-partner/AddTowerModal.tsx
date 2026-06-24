'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102';

interface AddTowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onAdded: () => void;
}

export default function AddTowerModal({ isOpen, onClose, projectId, onAdded }: AddTowerModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    totalFloors: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/towers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          projectId,
          totalFloors: parseInt(formData.totalFloors),
        }),
      });

      if (res.ok) {
        onAdded();
        onClose();
        setFormData({ name: '', totalFloors: '' });
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add tower');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding tower');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white relative">
          <h2 className="text-2xl font-black tracking-tight">Add New Tower</h2>
          <p className="text-blue-100 text-sm font-medium mt-1">Create a new tower for your project</p>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Tower Name</label>
            <input
              required
              type="text"
              placeholder="e.g. Tower A, Block 1"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Total Floors *</label>
            <input
              required
              type="number"
              min="1"
              placeholder="e.g. 15"
              value={formData.totalFloors}
              onChange={(e) => setFormData(prev => ({ ...prev, totalFloors: e.target.value }))}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all uppercase tracking-widest text-xs"
            >
              {loading ? 'Creating...' : 'Create Tower'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
