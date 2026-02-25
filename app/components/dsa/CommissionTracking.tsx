'use client';

import { useState, useMemo } from 'react';

interface Commission {
  id: string;
  leadId: string;
  leadName: string;
  propertyId?: string;
  propertyTitle?: string;
  status: 'pending' | 'approved' | 'paid';
  amount: number;
  date: Date;
  description: string;
}

interface CommissionTrackingProps {
  commissions: Commission[];
}

export default function CommissionTracking({ commissions }: CommissionTrackingProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const filteredCommissions = useMemo(() => {
    let filtered = commissions;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });
  }, [commissions, filterStatus, sortBy]);

  const totals = useMemo(() => {
    return {
      pending: commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.amount, 0),
      approved: commissions
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + c.amount, 0),
      paid: commissions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0),
    };
  }, [commissions]);

  const getStatusBadge = (status: Commission['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
    };
    return styles[status];
  };

  const getStatusIcon = (status: Commission['status']) => {
    const icons = {
      pending: <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      approved: <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
      paid: <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };
    return icons[status];
  };

  return (
    <div className="space-y-6">
      {/* Commission Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-600 text-sm font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">₹{(totals.pending / 100000).toFixed(1)}L</p>
          <p className="text-xs text-yellow-600 mt-1">
            {commissions.filter(c => c.status === 'pending').length} commissions
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-600 text-sm font-medium">Approved</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">₹{(totals.approved / 100000).toFixed(1)}L</p>
          <p className="text-xs text-blue-600 mt-1">
            {commissions.filter(c => c.status === 'approved').length} commissions
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 text-sm font-medium">Paid</p>
          <p className="text-2xl font-bold text-green-700 mt-1">₹{(totals.paid / 100000).toFixed(1)}L</p>
          <p className="text-xs text-green-600 mt-1">
            {commissions.filter(c => c.status === 'paid').length} commissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Commissions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="date">Latest First</option>
            <option value="amount">Highest Amount</option>
          </select>
        </div>
      </div>

      {/* Commissions List */}
      {filteredCommissions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600 font-medium">No commissions found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Lead Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCommissions.map(commission => (
                  <tr key={commission.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{commission.leadName}</p>
                        <p className="text-xs text-gray-500 mt-1">{commission.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 text-sm">{commission.propertyTitle || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">₹{(commission.amount / 100000).toFixed(2)}L</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                          commission.status
                        )}`}
                      >
                        {getStatusIcon(commission.status)} {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(commission.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commission Structure Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 font-medium text-sm mb-2">Commission Structure</p>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• <strong>Lead Qualification:</strong> ₹5,000 - ₹10,000 per qualified lead</li>
          <li>• <strong>Site Visit Coordination:</strong> ₹15,000 - ₹25,000 per scheduled visit</li>
          <li>• <strong>Booking Closure:</strong> 0.5% - 1% of property value</li>
          <li>• <strong>Bonus:</strong> Up to ₹50,000 for top performer of the month</li>
        </ul>
      </div>
    </div>
  );
}
