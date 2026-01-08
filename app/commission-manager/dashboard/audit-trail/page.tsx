'use client';

import { useState, useEffect } from 'react';

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: 'calculated' | 'approved' | 'adjusted' | 'paid' | 'rejected' | 'queried';
  personName: string;
  personRole: string;
  commissionAmount: number;
  previousAmount?: number;
  adjustmentReason?: string;
  performedBy: string;
  notes?: string;
  status: string;
}

const createAuditLog = (): AuditEntry[] => [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    action: 'approved',
    personName: 'John Smith',
    personRole: 'Consultant',
    commissionAmount: 100000,
    performedBy: 'Admin User',
    notes: 'Approved after verification',
    status: 'completed',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    action: 'adjusted',
    personName: 'Sarah Johnson',
    personRole: 'Regional Manager',
    commissionAmount: 240000,
    previousAmount: 220000,
    adjustmentReason: 'Bonus adjustment for regional performance',
    performedBy: 'Commission Manager',
    status: 'completed',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    action: 'calculated',
    personName: 'BuildCorp Ltd',
    personRole: 'Builder',
    commissionAmount: 180000,
    performedBy: 'System',
    notes: 'Auto-calculated from sales data',
    status: 'completed',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    action: 'paid',
    personName: 'Michael Chen',
    personRole: 'Consultant',
    commissionAmount: 75000,
    performedBy: 'Finance User',
    notes: 'Transferred to bank account HDFC****7890',
    status: 'completed',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    action: 'queried',
    personName: 'Priya Patel',
    personRole: 'Regional Manager',
    commissionAmount: 150000,
    performedBy: 'Priya Patel',
    notes: 'Raised dispute - seems commission is lower than expected',
    status: 'pending',
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    action: 'rejected',
    personName: 'Alex Kumar',
    personRole: 'Channel Partner',
    commissionAmount: 45000,
    performedBy: 'Commission Manager',
    notes: 'Rejected due to invalid sales documentation',
    status: 'completed',
  },
];

export default function AuditTrailPage() {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  useEffect(() => {
    setAuditLog(createAuditLog());
  }, []);

  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  const filteredLog = auditLog.filter(entry => {
    const actionMatch = filterAction === 'all' || entry.action === filterAction;
    const roleMatch = filterRole === 'all' || entry.personRole === filterRole;
    return actionMatch && roleMatch;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'calculated':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'adjusted':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'queried':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'calculated':
        return '🧮';
      case 'approved':
        return '✅';
      case 'adjusted':
        return '🔧';
      case 'paid':
        return '💳';
      case 'rejected':
        return '❌';
      case 'queried':
        return '❓';
      default:
        return '📝';
    }
  };

  const uniqueRoles = Array.from(new Set(auditLog.map(entry => entry.personRole)));

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Audit Log</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Actions</option>
              <option value="calculated">Calculated</option>
              <option value="approved">Approved</option>
              <option value="adjusted">Adjusted</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
              <option value="queried">Queried</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="space-y-4">
        {filteredLog.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500">No audit entries match the selected filters</p>
          </div>
        ) : (
          filteredLog.map(entry => (
            <div key={entry.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${getActionColor(entry.action)}`}>
                    {getActionIcon(entry.action)}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-gray-900 font-semibold capitalize">
                        {entry.action === 'queried' ? 'Commission Queried' : `Commission ${entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}`}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {entry.personName} ({entry.personRole})
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        entry.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs">Commission Amount</p>
                      <p className="text-gray-900 font-semibold">{formatCurrency(entry.commissionAmount)}</p>
                    </div>
                    {entry.previousAmount && (
                      <div>
                        <p className="text-gray-600 text-xs">Previous Amount</p>
                        <p className="text-gray-900">
                          {formatCurrency(entry.previousAmount)}
                          <span className="text-green-600 ml-2">
                            (+{formatCurrency(entry.commissionAmount - entry.previousAmount)})
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {entry.adjustmentReason && (
                    <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-xs font-semibold text-yellow-800">Adjustment Reason</p>
                      <p className="text-sm text-yellow-900">{entry.adjustmentReason}</p>
                    </div>
                  )}

                  {entry.notes && (
                    <div className="mb-3 bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs font-semibold text-blue-800">Notes</p>
                      <p className="text-sm text-blue-900">{entry.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-600 pt-3 border-t border-gray-100">
                    <span>By: {entry.performedBy}</span>
                    <span>{formatDate(entry.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
