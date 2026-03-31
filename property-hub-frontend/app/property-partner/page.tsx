'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import SidebarIcon from '@/app/components/SidebarIcon';
import { userService } from '@/app/services/userService';
import { propertyService, Property } from '@/app/services/propertyService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PropertyPartnerDashboard() {
  const { profileStatus, token } = useAuth();
  const isPremium = profileStatus?.['PROPERTY_PARTNER']?.profileData?.isPremium;

  const [agentCounts, setAgentCounts] = useState({
    consultants: 0,
    visitExecutives: 0,
    brokers: 0,
    totalAgents: 0
  });

  const [analyticsData, setAnalyticsData] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalUnits: 0,
    bookedUnits: 0,
    totalRevenue: 0,
    monthlyLeads: 0,
    conversionRate: 0,
    avgDaysToClose: 0,
  });

  const [topProperties, setTopProperties] = useState<any[]>([]);
  const [recentActivityData, setRecentActivityData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [consultants, visitExecutives, brokersData, leadsData, projects, unitsData] = await Promise.all([
          userService.getAllByRole('CONSULTANT', token, true, 1, 1),
          userService.getAllByRole('VISIT_EXECUTIVE', token, true, 1, 1),
          fetch(`${API_URL}/api/property-partners/brokers`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API_URL}/api/leads`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
          propertyService.getAll(token, true),
          fetch(`${API_URL}/api/units/my`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).then(r => r.json())
        ]);

        const units = unitsData?.units || [];

        const cCount = consultants.total || 0;
        const vCount = visitExecutives.total || 0;
        const bCount = Array.isArray(brokersData) ? brokersData.length : 0;
        const leads = Array.isArray(leadsData) ? leadsData : [];

        setAgentCounts({
          consultants: cCount,
          visitExecutives: vCount,
          brokers: bCount,
          totalAgents: cCount + vCount + bCount
        });

        const totalUnits = units.length || 0;
        const bookedUnits = units.filter((u: any) => u.status === 'SOLD').length;
        const totalRevenue = units.filter((u: any) => u.status === 'SOLD').reduce((sum: number, u: any) => sum + (parseFloat(u.salePrice) || 0), 0);

        setAnalyticsData({
          totalProjects: projects.length,
          activeProjects: projects.filter((p: Property) => p.status === 'APPROVED').length,
          totalUnits,
          bookedUnits,
          totalRevenue,
          monthlyLeads: leads.length || 0,
          conversionRate: leads.length ? Math.round((units.filter((u: any) => u.status === 'SOLD').length / leads.length) * 100) : 0,
          avgDaysToClose: 14, // Roughly 14 given real data varies
        });

        const projectStats = projects.map((p: any) => {
          const pUnits = units.filter((u: any) => u.projectId === p.id);
          const pBooked = pUnits.filter((u: any) => u.status === 'SOLD').length;
          const rate = pUnits.length > 0 ? Math.round((pBooked / pUnits.length) * 100) : 0;
          return {
            name: p.name,
            location: p.location,
            bookingRate: rate,
            units: pUnits.length,
            soldUnits: pBooked
          };
        }).sort((a: any, b: any) => b.soldUnits - a.soldUnits).slice(0, 3);

        setTopProperties(projectStats);

        const activities: any[] = [];

        // Add recent leads
        leads.slice(0, 5).forEach((l: any) => {
          activities.push({
            type: 'inquiry',
            message: `New inquiry from ${l.name} for ${l.projectRequirement || l.propertyCategory || 'Property'}`,
            time: new Date(l.createdAt),
            isDate: true
          });
        });

        // Add recent sold units
        units.filter((u: any) => u.status === 'SOLD').slice(0, 5).forEach((u: any) => {
          const proj = projects.find((p: any) => p.id === u.projectId);
          activities.push({
            type: 'booking',
            message: `Booking confirmed for ${u.unitNumber}${proj ? ' at ' + proj.name : ''}`,
            time: new Date(u.updatedAt || u.createdAt),
            isDate: true
          });
        });

        // Add recently approved projects
        projects.filter((p: any) => p.status === 'APPROVED').slice(0, 3).forEach((p: any) => {
          activities.push({
            type: 'approval',
            message: `Property "${p.name}" ${p.status.toLowerCase()}`,
            time: new Date(p.updatedAt || p.createdAt),
            isDate: true
          });
        });

        activities.sort((a, b) => b.time.getTime() - a.time.getTime());

        const formatTimeAgo = (date: Date) => {
          const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
          let interval = Math.floor(seconds / 31536000);
          if (interval >= 1) return interval + " years ago";
          interval = Math.floor(seconds / 2592000);
          if (interval >= 1) return interval + " months ago";
          interval = Math.floor(seconds / 86400);
          if (interval >= 1) return interval + " days ago";
          interval = Math.floor(seconds / 3600);
          if (interval >= 1) return interval + " hours ago";
          interval = Math.floor(seconds / 60);
          if (interval >= 1) return interval + " minutes ago";
          return Math.floor(seconds) + " seconds ago";
        };

        const finalActivity = activities.slice(0, 5).map(a => ({
          ...a,
          time: formatTimeAgo(a.time)
        }));
        setRecentActivityData(finalActivity.length > 0 ? finalActivity : [
          { type: 'booking', message: 'No recent activity yet', time: 'Just now' }
        ]);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
  }, [token]);

  // recentActivity replaced with state

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    }
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const bookingPercentage = analyticsData.totalUnits > 0 ? Math.round((analyticsData.bookedUnits / analyticsData.totalUnits) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link href="/dashboard/projects" className="flex items-center gap-6 p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <SidebarIcon name="building" className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">My Projects</h2>
              <p className="text-blue-100/90 text-sm mt-1">Manage your active property portfolio</p>
            </div>
            <div className="ml-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-blue-600 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/dashboard/units" className="flex items-center gap-6 p-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2.5rem] shadow-xl shadow-emerald-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <SidebarIcon name="home" className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">All Units</h2>
              <p className="text-emerald-100/90 text-sm mt-1">Inventory and real-time availability</p>
            </div>
            <div className="ml-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-emerald-600 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link href="/dashboard/projects" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              <span className="font-medium">{analyticsData.activeProjects}</span> active
            </p>
          </Link>

          <Link href="/dashboard/units" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Units</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{analyticsData.totalUnits}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium text-green-600">{analyticsData.bookedUnits}</span> booked ({bookingPercentage}%)
            </p>
          </Link>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(analyticsData.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">From all bookings</p>
          </div>

          <Link href="/dashboard/leads" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Buyer Leads</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{analyticsData.monthlyLeads}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium text-green-600">{analyticsData.conversionRate}%</span> conversion rate
            </p>
          </Link>

          <Link href="/dashboard/consultants" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Consultants</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{agentCounts.consultants}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <SidebarIcon name="person" className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Active consultants</p>
          </Link>

          <Link href="/dashboard/visit-executives" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Visit Executives</p>
                <p className="text-3xl font-bold text-rose-600 mt-2">{agentCounts.visitExecutives}</p>
              </div>
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                <SidebarIcon name="pin" className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">On-ground team</p>
          </Link>

          <Link href="/dashboard/brokers" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Brokers</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{agentCounts.brokers}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <SidebarIcon name="handshake" className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">External partners</p>
          </Link>
        </div>

        {/* Management Quick Access */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Management & Tools</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { name: 'Buyer Leads Management', href: '/dashboard/leads', icon: 'clipboard' as const, color: 'orange' },
              { name: 'Reels Management', href: '/dashboard/reels', icon: 'video' as const, color: 'blue' },
              { name: 'Ads Requests', href: '/dashboard/ads-requests', icon: 'megaphone' as const, color: 'indigo' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-${item.color}-200 transition-all text-center group relative`}
              >
                <div className="mb-3 flex justify-center"><SidebarIcon name={item.icon} className="w-6 h-6 text-gray-600" /></div>
                <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Premium Team Management</h2>
            {!isPremium && (
              <span className="bg-amber-50 text-amber-700 border border-amber-100 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                <SidebarIcon name="lock" className="w-3 h-3" /> Premium Feature
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Consultants', href: '/dashboard/consultants', icon: 'person' as const, color: 'blue' },
              { name: 'Brokers', href: '/dashboard/brokers', icon: 'handshake' as const, color: 'indigo' },
              { name: 'Visit Executives', href: '/dashboard/visit-executives', icon: 'pin' as const, color: 'rose' },
              { name: 'Project Allocation', href: '/dashboard/projects/allocation', icon: 'building' as const, color: 'emerald' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-${item.color}-200 transition-all text-center group relative ${!isPremium ? 'opacity-80 grayscale-[0.3]' : ''}`}
              >
                {!isPremium && <div className="absolute top-2 right-2 text-gray-400"><SidebarIcon name="lock" className="w-3.5 h-3.5" /></div>}
                <div className="mb-3 flex justify-center"><SidebarIcon name={item.icon} className="w-6 h-6 text-gray-600" /></div>
                <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Booking Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Overall Booking Progress</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Units Booked</span>
                <span className="text-2xl font-bold text-gray-900">{analyticsData.bookedUnits} / {analyticsData.totalUnits}</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                  style={{ width: `${bookingPercentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analyticsData.bookedUnits}</p>
                  <p className="text-sm text-gray-600">Booked</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.totalUnits - analyticsData.bookedUnits}</p>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{bookingPercentage}%</p>
                  <p className="text-sm text-gray-600">Booking Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Projects */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Top Performing Projects</h2>
            <div className="space-y-4">
              {topProperties.map((property, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{property.name}</p>
                      <p className="text-sm text-gray-600">{property.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{property.bookingRate}%</p>
                    <p className="text-sm text-gray-500">{property.units} units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivityData.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'booking' ? 'bg-green-100' :
                    activity.type === 'inquiry' ? 'bg-blue-100' :
                      activity.type === 'visit' ? 'bg-purple-100' :
                        'bg-amber-100'
                    }`}>
                    {activity.type === 'booking' && (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {activity.type === 'inquiry' && (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                    {activity.type === 'visit' && (
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {activity.type === 'approval' && (
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Avg. Days to Close</p>
                <p className="text-2xl font-bold text-blue-900">{analyticsData.avgDaysToClose} days</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <p className="text-sm text-green-700 font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-900">{analyticsData.conversionRate}%</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <p className="text-sm text-purple-700 font-medium">Active Projects</p>
                <p className="text-2xl font-bold text-purple-900">{analyticsData.activeProjects}</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                <p className="text-sm text-orange-700 font-medium">This Month&apos;s Buyer Leads</p>
                <p className="text-2xl font-bold text-orange-900">{analyticsData.monthlyLeads}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
