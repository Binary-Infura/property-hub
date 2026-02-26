'use client';

import { useState } from 'react';

interface ReportData {
  period: string;
  totalSales: number;
  totalCommissions: number;
  byRole: {
    consultant: { count: number; amount: number };
    'city-manager': { count: number; amount: number };
    builder: { count: number; amount: number };
    'channel-partner': { count: number; amount: number };
  };
  byCity: {
    [key: string]: { count: number; amount: number };
  };
  topPerformers: Array<{
    name: string;
    role: string;
    commission: number;
  }>;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024-01');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');

  const generateReportData = (type: string, period: string): ReportData => {
    return {
      period: type === 'weekly' ? `Week of ${period}` : type === 'monthly' ? `${period}` : `Year ${period}`,
      totalSales: 125000000,
      totalCommissions: 2500000,
      byRole: {
        consultant: { count: 45, amount: 900000 },
        'city-manager': { count: 12, amount: 720000 },
        builder: { count: 8, amount: 600000 },
        'channel-partner': { count: 3, amount: 280000 },
      },
      byCity: {
        'North India': { count: 20, amount: 650000 },
        'South India': { count: 18, amount: 580000 },
        'West India': { count: 15, amount: 720000 },
        'East India': { count: 15, amount: 550000 },
      },
      topPerformers: [
        { name: 'John Smith', role: 'Consultant', commission: 150000 },
        { name: 'Sarah Johnson', role: 'City Manager', commission: 240000 },
        { name: 'BuildCorp Ltd', role: 'Property Partner', commission: 180000 },
      ],
    };
  };

  const reportData = generateReportData(reportType, selectedPeriod);

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToPDF();
    }
  };

  const exportToCSV = () => {
    const csv = generateCSVContent();
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    );
    element.setAttribute(
      'download',
      `commission-report-${reportType}-${selectedPeriod}.csv`
    );
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportToPDF = () => {
    alert(`PDF export for ${reportType} report (${selectedPeriod}) would be generated here`);
  };

  const generateCSVContent = () => {
    let csv = `Commission Report - ${reportData.period}\n\n`;
    csv += `Total Sales,${reportData.totalSales}\n`;
    csv += `Total Commissions,${reportData.totalCommissions}\n\n`;
    csv += `Commission by Role\n`;
    csv += `Role,Count,Amount\n`;
    Object.entries(reportData.byRole).forEach(([role, data]) => {
      csv += `${role},${data.count},${data.amount}\n`;
    });
    csv += `\\nCommission by City\\n`;
    csv += `City,Count,Amount\\n`;
    Object.entries(reportData.byCity).forEach(([city, data]) => {
      csv += `${city},${data.count},${data.amount}\\n`;
    });
    return csv;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPeriodsForType = (type: string) => {
    if (type === 'weekly') {
      return [
        '2024-01-01',
        '2024-01-08',
        '2024-01-15',
        '2024-01-22',
        '2024-01-29',
      ];
    } else if (type === 'monthly') {
      return [
        '2024-01',
        '2024-02',
        '2024-03',
        '2024-04',
        '2024-05',
        '2024-06',
        '2024-07',
        '2024-08',
        '2024-09',
        '2024-10',
        '2024-11',
        '2024-12',
      ];
    } else {
      return ['2022', '2023', '2024'];
    }
  };

  return (
    <div>
      {/* Report Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={e => {
                setReportType(e.target.value as 'weekly' | 'monthly' | 'yearly');
                setSelectedPeriod(getPeriodsForType(e.target.value)[0]);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {getPeriodsForType(reportType).map(period => (
                <option key={period} value={period}>
                  {reportType === 'weekly'
                    ? `Week of ${period}`
                    : reportType === 'monthly'
                      ? period
                      : `Year ${period}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <select
              value={exportFormat}
              onChange={e => setExportFormat(e.target.value as 'pdf' | 'csv')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Sales ({reportData.period})</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(reportData.totalSales)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Commissions ({reportData.period})</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {formatCurrency(reportData.totalCommissions)}
          </p>
        </div>
      </div>

      {/* Commission by Role */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission by Role</h3>
          <div className="space-y-3">
            {Object.entries(reportData.byRole).map(([role, data]) => (
              <div key={role} className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="text-gray-900 font-medium">
                    {role
                      .split('-')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </p>
                  <p className="text-xs text-gray-600">{data.count} people</p>
                </div>
                <p className="text-gray-900 font-semibold">{formatCurrency(data.amount)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission by City</h3>
          <div className="space-y-3">
            {Object.entries(reportData.byCity).map(([city, data]) => (
              <div key={city} className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="text-gray-900 font-medium">{city}</p>
                  <p className="text-xs text-gray-600">{data.count} commissions</p>
                </div>
                <p className="text-gray-900 font-semibold">{formatCurrency(data.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportData.topPerformers.map((performer, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">#{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{performer.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{performer.role}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                    {formatCurrency(performer.commission)}
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
