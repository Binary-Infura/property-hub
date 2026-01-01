'use client';

import { useState } from 'react';

interface Sale {
  id: string;
  type: 'consultant' | 'regional-manager' | 'builder' | 'channel-partner';
  personName: string;
  amount: number;
  region: string;
  date: Date;
  status: 'pending' | 'approved' | 'processed';
}

interface Commission {
  id: string;
  saleId: string;
  type: string;
  personName: string;
  baseAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  region: string;
  calculatedAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
}

export default function CommissionManagerDashboard() {
  const [sales] = useState<Sale[]>([
    {
      id: '1',
      type: 'consultant',
      personName: 'John Smith',
      amount: 5000000,
      region: 'North India',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'pending',
    },
    {
      id: '2',
      type: 'regional-manager',
      personName: 'Sarah Johnson',
      amount: 8000000,
      region: 'South India',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'approved',
    },
    {
      id: '3',
      type: 'builder',
      personName: 'BuildCorp Ltd',
      amount: 12000000,
      region: 'West India',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'processed',
    },
  ]);

  const [commissions] = useState<Commission[]>([
    {
      id: '1',
      saleId: '1',
      type: 'consultant',
      personName: 'John Smith',
      baseAmount: 5000000,
      commissionPercentage: 2,
      commissionAmount: 100000,
      status: 'pending',
      region: 'North India',
      calculatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      saleId: '2',
      type: 'regional-manager',
      personName: 'Sarah Johnson',
      baseAmount: 8000000,
      commissionPercentage: 3,
      commissionAmount: 240000,
      status: 'approved',
      region: 'South India',
      calculatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      saleId: '3',
      type: 'builder',
      personName: 'BuildCorp Ltd',
      baseAmount: 12000000,
      commissionPercentage: 1.5,
      commissionAmount: 180000,
      status: 'paid',
      region: 'West India',
      calculatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(),
      paidAt: new Date(),
    },
  ]);

  const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalCommissionsAmount = commissions.reduce((sum, comm) => sum + comm.commissionAmount, 0);
  const pendingPayoutsAmount = commissions
    .filter(c => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, comm) => sum + comm.commissionAmount, 0);
  const paidAmount = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, comm) => sum + comm.commissionAmount, 0);

  const pendingCount = commissions.filter(c => c.status === 'pending').length;
  const approvedCount = commissions.filter(c => c.status === 'approved').length;
  const paidCount = commissions.filter(c => c.status === 'paid').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Sales</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(totalSalesAmount)}</p>
          <p className="text-xs text-gray-500 mt-2">{sales.length} transactions</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Commissions</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(totalCommissionsAmount)}</p>
          <p className="text-xs text-gray-500 mt-2">All roles combined</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Pending Payouts</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{formatCurrency(pendingPayoutsAmount)}</p>
          <p className="text-xs text-gray-500 mt-2">{pendingCount + approvedCount} commissions</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Paid Out</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(paidAmount)}</p>
          <p className="text-xs text-gray-500 mt-2">{paidCount} processed</p>
        </div>
      </div>

      {/* Region-wise Breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Region</h3>
          <div className="space-y-3">
            {['North India', 'South India', 'West India', 'East India'].map(region => {
              const regionSales = sales.filter(s => s.region === region);
              const regionAmount = regionSales.reduce((sum, s) => sum + s.amount, 0);
              return (
                <div key={region} className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-700">{region}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">{regionSales.length} sales</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(regionAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commissions by Role</h3>
          <div className="space-y-3">
            {['consultant', 'regional-manager', 'builder', 'channel-partner'].map(type => {
              const roleCommissions = commissions.filter(c => c.type === type);
              const roleAmount = roleCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
              const label = type
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              return (
                <div key={type} className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-700">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">{roleCommissions.length} people</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(roleAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Commissions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Commissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Person/Company</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Region</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Sales Amount</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Commission</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commissions.map(commission => (
                <tr key={commission.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{commission.personName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {commission.type
                      .split('-')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{commission.region}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                    {formatCurrency(commission.baseAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                    {formatCurrency(commission.commissionAmount)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        commission.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : commission.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
