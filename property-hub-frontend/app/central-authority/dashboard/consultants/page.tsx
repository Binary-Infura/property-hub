'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import { userService, User } from '@/app/services/userService';

export default function ConsultantsPage() {
  const { token } = useAuth();
  const { activeContext } = useUnifiedApp();
  const [consultants, setConsultants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const fetchConsultants = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const result = await userService.getAllByRole(
        'CONSULTANT',
        token
      );
      setConsultants(result.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch consultants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, [token]);

  const handleAddConsultant = () => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    setShowAddModal(true);
  };

  const handleEditConsultant = (consultant: User) => {
    setFormData({
      firstName: consultant.firstName,
      lastName: consultant.lastName || '',
      email: consultant.email,
      phone: consultant.phone || '',
    });
    setSelectedConsultant(consultant);
    setShowEditModal(true);
  };

  const handleSaveConsultant = async () => {
    if (!token) return;
    try {
      if (selectedConsultant) {
        const updated = await userService.update(selectedConsultant.id, {
          ...formData,
        }, token);
        setConsultants(consultants.map(c => c.id === selectedConsultant.id ? updated : c));
        setShowEditModal(false);
      } else {
        const created = await userService.create({
          ...formData,
          role: 'CONSULTANT',
        }, token);
        setConsultants([created, ...consultants]);
        setShowAddModal(false);
      }
      setFormData({ firstName: '', lastName: '', email: '', phone: '' });
      setSelectedConsultant(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save consultant');
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (!token) return;
    try {
      const updated = await userService.toggleStatus(id, token);
      setConsultants(consultants.map(c => c.id === id ? updated : c));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const activeCount = consultants.filter(c => c.status === 'active').length;

  if (loading && consultants.length === 0) {
    return <div className="p-8">Loading consultants...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultants Management</h1>
            <p className="text-gray-600 mt-1">Manage consultants and their clients</p>
          </div>
          <button
            onClick={handleAddConsultant}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Consultant
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Consultants</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{consultants.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Clients</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">N/A</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cities</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {consultants.map((consultant) => (
                  <tr key={consultant.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{consultant.firstName} {consultant.lastName}</p>
                        <p className="text-sm text-gray-500">{consultant.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {consultant.cityAllocations?.map(a => a.city.name).join(', ') || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-gray-700">{consultant.phone || 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${consultant.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {consultant.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditConsultant(consultant)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(consultant.id)}
                          className={`px-3 py-1 rounded text-sm font-medium ${consultant.status === 'active'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                            }`}
                        >
                          {consultant.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                {showEditModal ? 'Edit Consultant' : 'Add Consultant'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setFormData({ firstName: '', lastName: '', email: '', phone: '' });
                }}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                  disabled={showEditModal}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-gray-400"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setFormData({ firstName: '', lastName: '', email: '', phone: '' });
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConsultant}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 text-sm"
                >
                  {showEditModal ? 'Save Changes' : 'Add Consultant'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
