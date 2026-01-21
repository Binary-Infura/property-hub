'use client';

import { useState } from 'react';

interface PropertyPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  propertiesCount: number;
  createdAt: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
}

export default function PropertyPartnersPage() {
  const [builders, setPropertyPartners] = useState<PropertyPartner[]>([
    {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh@buildera.com',
      phone: '+91 98765 43210',
      company: 'Property Partner A',
      status: 'active',
      propertiesCount: 5,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya@builderb.com',
      phone: '+91 97654 32109',
      company: 'Property Partner B',
      status: 'active',
      propertiesCount: 3,
      createdAt: '2024-02-20',
    },
    {
      id: '3',
      name: 'Arun Patel',
      email: 'arun@builderc.com',
      phone: '+91 96543 21098',
      company: 'Property Partner C',
      status: 'inactive',
      propertiesCount: 0,
      createdAt: '2024-03-10',
    },
  ]);

  const [allProperties] = useState<Property[]>([
    { id: '1', title: 'Sunset Towers, Bandra', location: 'Bandra, Mumbai', price: '₹85L' },
    { id: '2', title: 'Green Valley Homes, Powai', location: 'Powai, Mumbai', price: '₹52L' },
    { id: '3', title: 'Luxury Heights, Worli', location: 'Worli, Mumbai', price: '₹1.2Cr' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPropertyPartner, setSelectedPropertyPartner] = useState<PropertyPartner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  const handleAddPropertyPartner = () => {
    setFormData({ name: '', email: '', phone: '', company: '' });
    setShowAddModal(true);
  };

  const handleEditPropertyPartner = (builder: PropertyPartner) => {
    setFormData({
      name: builder.name,
      email: builder.email,
      phone: builder.phone,
      company: builder.company,
    });
    setSelectedPropertyPartner(builder);
    setShowEditModal(true);
  };

  const handleSavePropertyPartner = () => {
    if (selectedPropertyPartner) {
      // Edit existing
      setPropertyPartners(builders.map(b =>
        b.id === selectedPropertyPartner.id
          ? { ...b, ...formData }
          : b
      ));
      setShowEditModal(false);
    } else {
      // Add new
      const newPropertyPartner: PropertyPartner = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
        propertiesCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPropertyPartners([...builders, newPropertyPartner]);
      setShowAddModal(false);
    }
    setFormData({ name: '', email: '', phone: '', company: '' });
    setSelectedPropertyPartner(null);
  };

  const handleToggleStatus = (id: string) => {
    setPropertyPartners(builders.map(b =>
      b.id === id
        ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' }
        : b
    ));
  };

  const handleAssignProperties = (builder: PropertyPartner) => {
    setSelectedPropertyPartner(builder);
    setShowAssignModal(true);
  };

  const activeCount = builders.filter(b => b.status === 'active').length;
  const inactiveCount = builders.filter(b => b.status === 'inactive').length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Partners Management</h1>
            <p className="text-gray-600 mt-1">Manage builders and their properties</p>
          </div>
          <button
            onClick={handleAddPropertyPartner}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Property Partner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Property Partners</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{builders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Inactive</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{inactiveCount}</p>
        </div>
      </div>

      {/* Property Partners List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Properties</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {builders.map((builder) => (
                  <tr key={builder.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{builder.name}</p>
                        <p className="text-sm text-gray-500">{builder.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{builder.company}</td>
                    <td className="py-4 px-4 text-gray-700">{builder.phone}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {builder.propertiesCount}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${builder.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {builder.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditPropertyPartner(builder)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(builder.id)}
                          className={`px-3 py-1 rounded text-sm font-medium ${builder.status === 'active'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                            }`}
                        >
                          {builder.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleAssignProperties(builder)}
                          className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded text-sm font-medium"
                        >
                          Assign Properties
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

      {/* Add Property Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Property Partner</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({ name: '', email: '', phone: '', company: '' });
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePropertyPartner}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Add Property Partner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Partner Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Property Partner</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPropertyPartner(null);
                  setFormData({ name: '', email: '', phone: '', company: '' });
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePropertyPartner}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Properties Modal */}
      {showAssignModal && selectedPropertyPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Assign Properties to {selectedPropertyPartner.name}
            </h2>
            <div className="space-y-3 mb-6">
              {allProperties.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{property.title}</p>
                    <p className="text-sm text-gray-600">{property.location} • {property.price}</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    Assign
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedPropertyPartner(null);
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
