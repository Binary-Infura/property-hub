'use client';

import { useState } from 'react';

interface Dispute {
  id: string;
  personName: string;
  personRole: 'consultant' | 'regional-manager' | 'builder' | 'channel-partner';
  commissionAmount: number;
  raisedAt: Date;
  status: 'open' | 'under-review' | 'resolved' | 'rejected';
  description: string;
  attachments?: string[];
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: '1',
      personName: 'Priya Patel',
      personRole: 'regional-manager',
      commissionAmount: 150000,
      raisedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'under-review',
      description: 'Commission seems lower than expected based on sales performance. Should have received 200K instead of 150K.',
      attachments: ['sales-report.pdf', 'comparison-sheet.xlsx'],
    },
    {
      id: '2',
      personName: 'John Smith',
      personRole: 'consultant',
      commissionAmount: 100000,
      raisedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'resolved',
      description: 'Discrepancy in calculation - one sale was not included in the commission calculation.',
      resolution: 'Sale was in pending status at calculation time. Additional 25K commission approved and processed.',
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      resolvedBy: 'Commission Manager',
    },
    {
      id: '3',
      personName: 'BuildCorp Ltd',
      personRole: 'builder',
      commissionAmount: 180000,
      raisedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'rejected',
      description: 'Requesting commission on property that was rejected during quality review.',
      resolution: 'Property was rejected due to quality issues. No commission applicable per policy.',
      resolvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      resolvedBy: 'Commission Manager',
    },
    {
      id: '4',
      personName: 'Alex Kumar',
      personRole: 'channel-partner',
      commissionAmount: 45000,
      raisedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'open',
      description: 'Requesting review of commission calculation methodology. Believes percentage should be 2.5% instead of 2%.',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'open' | 'under-review' | 'resolved' | 'rejected'>('open');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [resolutionType, setResolutionType] = useState<'resolve' | 'reject'>('resolve');

  const handleResolveDispute = (id: string) => {
    setSelectedId(id);
    setShowResolutionModal(true);
  };

  const handleConfirmResolution = () => {
    if (selectedId) {
      const newStatus = resolutionType === 'resolve' ? 'resolved' : 'rejected';
      setDisputes(
        disputes.map(d =>
          d.id === selectedId
            ? {
                ...d,
                status: newStatus,
                resolution: resolutionText,
                resolvedAt: new Date(),
                resolvedBy: 'Commission Manager',
              }
            : d
        )
      );
      setShowResolutionModal(false);
      setResolutionText('');
      setSelectedId(null);
    }
  };

  const filteredDisputes = disputes.filter(d => {
    if (activeTab === 'open') return d.status === 'open';
    if (activeTab === 'under-review') return d.status === 'under-review';
    if (activeTab === 'resolved') return d.status === 'resolved';
    if (activeTab === 'rejected') return d.status === 'rejected';
    return false;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Open Disputes</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {disputes.filter(d => d.status === 'open').length}
          </p>
          <p className="text-xs text-gray-500 mt-2">Awaiting action</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Under Review</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {disputes.filter(d => d.status === 'under-review').length}
          </p>
          <p className="text-xs text-gray-500 mt-2">Being investigated</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Resolved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {disputes.filter(d => d.status === 'resolved').length}
          </p>
          <p className="text-xs text-gray-500 mt-2">Completed</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Rejected</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">
            {disputes.filter(d => d.status === 'rejected').length}
          </p>
          <p className="text-xs text-gray-500 mt-2">Not upheld</p>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('open')}
            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
              activeTab === 'open'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Open ({disputes.filter(d => d.status === 'open').length})
          </button>
          <button
            onClick={() => setActiveTab('under-review')}
            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
              activeTab === 'under-review'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Under Review ({disputes.filter(d => d.status === 'under-review').length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
              activeTab === 'resolved'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Resolved ({disputes.filter(d => d.status === 'resolved').length})
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${
              activeTab === 'rejected'
                ? 'border-gray-500 text-gray-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Rejected ({disputes.filter(d => d.status === 'rejected').length})
          </button>
        </div>

        {/* Disputes List */}
        <div className="p-6">
          {filteredDisputes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">No disputes in this category</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDisputes.map(dispute => (
                <div
                  key={dispute.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-gray-900 font-semibold">{dispute.personName}</h4>
                      <p className="text-sm text-gray-600">
                        {dispute.personRole
                          .split('-')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')} • Commission: {formatCurrency(dispute.commissionAmount)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(dispute.status)}`}>
                      {dispute.status
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-900 font-medium mb-1">Dispute Details</p>
                    <p className="text-sm text-gray-600">{dispute.description}</p>
                  </div>

                  {dispute.attachments && dispute.attachments.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-900 font-medium mb-2">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {dispute.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href="#"
                            className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded"
                          >
                            📎 {attachment}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {dispute.resolution && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs font-semibold text-blue-800 mb-1">Resolution</p>
                      <p className="text-sm text-blue-900">{dispute.resolution}</p>
                      {dispute.resolvedAt && (
                        <p className="text-xs text-blue-700 mt-2">
                          Resolved by {dispute.resolvedBy} on {formatDate(dispute.resolvedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600">Raised on {formatDate(dispute.raisedAt)}</p>
                    {(activeTab === 'open' || activeTab === 'under-review') && (
                      <button
                        onClick={() => handleResolveDispute(dispute.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && selectedId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolve Dispute</h3>
            <p className="text-gray-600 text-sm mb-4">
              {disputes.find(d => d.id === selectedId)?.personName}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Type</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="resolve"
                    checked={resolutionType === 'resolve'}
                    onChange={e => setResolutionType(e.target.value as 'resolve' | 'reject')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Resolve (Uphold)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="reject"
                    checked={resolutionType === 'reject'}
                    onChange={e => setResolutionType(e.target.value as 'resolve' | 'reject')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Reject</span>
                </label>
              </div>
            </div>

            <textarea
              value={resolutionText}
              onChange={e => setResolutionText(e.target.value)}
              placeholder="Enter resolution details..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowResolutionModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
