'use client';

import { useState } from 'react';

interface Consultant {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  status: 'active' | 'inactive';
  clientsCount: number;
  buildersCount: number;
  propertiesCount: number;
  createdAt: string;
}

interface PropertyPartner {
  id: string;
  name: string;
  company: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([
    {
      id: '1',
      name: 'Rajesh Sharma',
      email: 'rajesh@propertyhub.com',
      phone: '+91 98765 43210',
      experience: '10+ years',
      status: 'active',
      clientsCount: 15,
      buildersCount: 3,
      propertiesCount: 8,
      createdAt: '2024-01-10',
    },
    {
      id: '2',
      name: 'Priya Patel',
      email: 'priya@propertyhub.com',
      phone: '+91 97654 32109',
      experience: '8+ years',
      status: 'active',
      clientsCount: 12,
      buildersCount: 2,
      propertiesCount: 6,
      createdAt: '2024-02-15',
    },
    {
      id: '3',
      name: 'Arun Kumar',
      email: 'arun@propertyhub.com',
      phone: '+91 96543 21098',
      experience: '5+ years',
      status: 'inactive',
      clientsCount: 0,
      buildersCount: 0,
      propertiesCount: 0,
      createdAt: '2024-03-20',
    },
  ]);

  const [allPropertyPartners] = useState<PropertyPartner[]>([
    { id: '1', name: 'Rajesh Kumar', company: 'Property Partner A' },
    { id: '2', name: 'Priya Sharma', company: 'Property Partner B' },
    { id: '3', name: 'Arun Patel', company: 'Property Partner C' },
  ]);

  const [allProperties] = useState<Property[]>([
    { id: '1', title: 'Sunset Towers, Bandra', location: 'Bandra, Mumbai', price: '₹85L' },
    { id: '2', title: 'Green Valley Homes, Powai', location: 'Powai, Mumbai', price: '₹52L' },
    { id: '3', title: 'Luxury Heights, Worli', location: 'Worli, Mumbai', price: '₹1.2Cr' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
  });

  const handleAddConsultant = () => {
    setFormData({ name: '', email: '', phone: '', experience: '' });
    setShowAddModal(true);
  };

  const handleEditConsultant = (consultant: Consultant) => {
    setFormData({
      name: consultant.name,
      email: consultant.email,
      phone: consultant.phone,
      experience: consultant.experience,
    });
    setSelectedConsultant(consultant);
    setShowEditModal(true);
  };

  const handleSaveConsultant = () => {
    if (selectedConsultant) {
      // Edit existing
      setConsultants(consultants.map(c =>
        c.id === selectedConsultant.id
          ? { ...c, ...formData }
          : c
      ));
      setShowEditModal(false);
    } else {
      // Add new
      const newConsultant: Consultant = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        clientsCount: 0,
        buildersCount: 0,
        propertiesCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setConsultants([...consultants, newConsultant]);
      setShowAddModal(false);
    }
    setFormData({ name: '', email: '', phone: '', experience: '' });
    setSelectedConsultant(null);
  };

  const handleToggleStatus = (id: string) => {
    setConsultants(consultants.map(c =>
      c.id === id
        ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
        : c
    ));
  };

  const handleAssignResources = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowAssignModal(true);
  };

  const activeCount = consultants.filter(c => c.status === 'active').length;
  const inactiveCount = consultants.filter(c => c.status === 'inactive').length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultants Management</h1>
            <p className="text-gray-600 mt-1">Manage consultants and their assignments</p>
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

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Consultants</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{consultants.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Inactive</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{inactiveCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Clients</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {consultants.reduce((sum, c) => sum + c.clientsCount, 0)}
          </p>
        </div>
      </div>

      {/* Consultants List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Experience</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Clients</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Property Partners</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Properties</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {consultants.map((consultant) => (
                  <tr key={consultant.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{consultant.name}</p>
                        <p className="text-sm text-gray-500">{consultant.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{consultant.phone}</td>
                    <td className="py-4 px-4 text-gray-700">{consultant.experience}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {consultant.clientsCount}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {consultant.buildersCount}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {consultant.propertiesCount}
                      </span>
                    </td>
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
                        <button
                          onClick={() => handleAssignResources(consultant)}
                          className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded text-sm font-medium"
                        >
                          Assign
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

      {/* Add Consultant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Consultant</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g., 10+ years"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: '', email: '', phone: '', experience: '' });
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConsultant}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Add Consultant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Consultant Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Consultant</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedConsultant(null);
                  setFormData({ name: '', email: '', phone: '', experience: '' });
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConsultant}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Resources Modal */}
      {showAssignModal && selectedConsultant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Assign Property Partners & Properties to {selectedConsultant.name}
            </h2>

            {/* Assign Property Partners Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Property Partners</h3>
              <div className="space-y-3">
                {allPropertyPartners.map((builder) => (
                  <div key={builder.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{builder.name}</p>
                      <p className="text-sm text-gray-600">{builder.company}</p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                      Assign Property Partner
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Assign Properties Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Properties</h3>
              <div className="space-y-3">
                {allProperties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{property.title}</p>
                      <p className="text-sm text-gray-600">{property.location} • {property.price}</p>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                      Assign Property
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedConsultant(null);
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

