'use client';

import { useState } from 'react';

interface Commission {
  id: string;
  personName: string;
  type: 'consultant' | 'regional-manager' | 'builder' | 'channel-partner';
  region: string;
  baseAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  calculatedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
  bankAccount?: string;
  notes?: string;
}

export default function PayoutsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([
    {
      id: '1',
      personName: 'John Smith',
      type: 'consultant',
      region: 'North India',
      baseAmount: 5000000,
      commissionPercentage: 2,
      commissionAmount: 100000,
      status: 'pending',
      calculatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      bankAccount: 'HDFC****1234',
    },
    {
      id: '2',
      personName: 'Sarah Johnson',
      type: 'regional-manager',
      region: 'South India',
      baseAmount: 8000000,
      commissionPercentage: 3,
      commissionAmount: 240000,
      status: 'pending',
      calculatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      bankAccount: 'ICICI****5678',
    },
    {
      id: '3',
      personName: 'BuildCorp Ltd',
      type: 'builder',
      region: 'West India',
      baseAmount: 12000000,
      commissionPercentage: 1.5,
      commissionAmount: 180000,
      status: 'approved',
      calculatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(),
      bankAccount: 'AXIS****9012',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'paid'>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  const handleApprove = (id: string) => {
    setSelectedId(id);
    setShowApprovalModal(true);
  };

  const handleConfirmApproval = () => {
    if (selectedId) {
      setCommissions(
        commissions.map(c =>
          c.id === selectedId
            ? { ...c, status: 'approved', approvedAt: new Date(), notes: approvalNotes }
            : c
        )
      );
      setShowApprovalModal(false);
      setApprovalNotes('');
      setSelectedId(null);
    }
  };

  const handleMarkAsPaid = (id: string) => {
    setCommissions(
      commissions.map(c =>
        c.id === id ? { ...c, status: 'paid', paidAt: new Date() } : c
      )
    );
  };

  const filteredCommissions = commissions.filter(c => {
    if (activeTab === 'pending') return c.status === 'pending';
    if (activeTab === 'approved') return c.status === 'approved';
    if (activeTab === 'paid') return c.status === 'paid';
    return false;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const pendingAmount = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  const approvedAmount = commissions
    .filter(c => c.status === 'approved')
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  const paidAmount = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{formatCurrency(pendingAmount)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {commissions.filter(c => c.status === 'pending').length} commissions
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Ready to Process</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(approvedAmount)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {commissions.filter(c => c.status === 'approved').length} commissions
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Paid Out</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(paidAmount)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {commissions.filter(c => c.status === 'paid').length} commissions
          </p>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
              activeTab === 'pending'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              Pending ({commissions.filter(c => c.status === 'pending').length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
              activeTab === 'approved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              Ready to Process ({commissions.filter(c => c.status === 'approved').length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
              activeTab === 'paid'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              Paid ({commissions.filter(c => c.status === 'paid').length})
            </span>
          </button>
        </div>

        {/* Commissions List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Person/Company</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Region</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Commission</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bank Account</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No commissions in this status
                  </td>
                </tr>
              ) : (
                filteredCommissions.map(commission => (
                  <tr key={commission.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{commission.personName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {commission.type
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{commission.region}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                      {formatCurrency(commission.commissionAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{commission.bankAccount}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {activeTab === 'pending' && (
                          <button
                            onClick={() => handleApprove(commission.id)}
                            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                          >
                            Approve
                          </button>
                        )}
                        {activeTab === 'approved' && (
                          <button
                            onClick={() => handleMarkAsPaid(commission.id)}
                            className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition"
                          >
                            Mark Paid
                          </button>
                        )}
                        {activeTab === 'paid' && (
                          <span className="px-3 py-1 text-sm text-gray-600">
                            Paid {commission.paidAt && formatDate(commission.paidAt)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Commission Payout</h3>
            <p className="text-gray-600 text-sm mb-4">
              {commissions.find(c => c.id === selectedId)?.personName} -{' '}
              {formatCurrency(commissions.find(c => c.id === selectedId)?.commissionAmount || 0)}
            </p>
            <textarea
              value={approvalNotes}
              onChange={e => setApprovalNotes(e.target.value)}
              placeholder="Add approval notes (optional)..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
