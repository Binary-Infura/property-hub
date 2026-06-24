'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { 
  buyerLoansService, 
  projectLoansService, 
  BuyerLoanApplication, 
  ProjectLoanApplication,
  BuyerLoanStatus,
  ReviewStatus,
} from '@/app/services/loanService';
import Link from 'next/link';
import SidebarIcon from '@/app/components/SidebarIcon';

// ─── Status Utilities ─────────────────────────────────────────────────────────

const getBuyerStatusColor = (status: BuyerLoanStatus) => {
  const colors: Record<BuyerLoanStatus, string> = {
    'NEW': 'bg-indigo-100 text-indigo-700',
    'DOC_PENDING': 'bg-amber-100 text-amber-700',
    'UNDER_REVIEW': 'bg-blue-100 text-blue-700',
    'APPROVED': 'bg-emerald-100 text-emerald-700',
    'REJECTED': 'bg-rose-100 text-rose-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

const getProjectStatusColor = (status: ReviewStatus) => {
  const colors: Record<ReviewStatus, string> = {
    'PENDING': 'bg-amber-100 text-amber-700',
    'IN_PROGRESS': 'bg-blue-100 text-blue-700',
    'COMPLETED': 'bg-emerald-100 text-emerald-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

function formatAmount(amount: number | null | undefined) {
  if (!amount) return '—';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function LoanPartnerDashboard() {
  const { token } = useAuth();
  const [buyerLoans, setBuyerLoans] = useState<BuyerLoanApplication[]>([]);
  const [projectLoans, setProjectLoans] = useState<ProjectLoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overall' | 'buyer' | 'project'>('overall');

  useEffect(() => {
    if (!token) return;
    
    setLoading(true);
    Promise.all([
      buyerLoansService.getAll(token).catch(() => []),
      projectLoansService.getAll(token).catch(() => [])
    ]).then(([bLoans, pLoans]) => {
      setBuyerLoans(bLoans);
      setProjectLoans(pLoans);
    }).finally(() => {
      setLoading(false);
    });
  }, [token]);

  // Stats
  const totalBuyerLoans = buyerLoans.length;
  const approvedBuyerLoans = buyerLoans.filter(l => l.status === 'APPROVED').length;
  const totalProjectLoans = projectLoans.length;
  const completedProjectLoans = projectLoans.filter(l => l.reviewStatus === 'COMPLETED').length;
  const pendingActionCount = buyerLoans.filter(l => l.status === 'NEW' || l.status === 'DOC_PENDING').length + projectLoans.filter(l => l.reviewStatus === 'PENDING').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Loan Partner Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage buyer loan applications and project bank eligibility reviews</p>
        </div>

        {/* Quick Actions / Featured Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link href="/loan-partner/buyer-loans" className="flex items-center gap-6 p-8 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] shadow-xl shadow-indigo-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500 shrink-0">
              <SidebarIcon name="person" className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Buyer Loans</h2>
              <p className="text-indigo-100/90 text-sm mt-1">Process {totalBuyerLoans} active applications</p>
            </div>
            <div className="ml-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-indigo-600 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link href="/loan-partner/project-loans" className="flex items-center gap-6 p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500 shrink-0">
              <SidebarIcon name="bank" className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Project Loans</h2>
              <p className="text-blue-100/90 text-sm mt-1">Eligibility reviews for {totalProjectLoans} projects</p>
            </div>
            <div className="ml-auto w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-blue-600 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Buyer Apps</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalBuyerLoans}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <SidebarIcon name="person" className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              <span className="font-bold">{approvedBuyerLoans}</span> approved
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Project Reviews</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{totalProjectLoans}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <SidebarIcon name="bank" className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2">
              <span className="font-bold">{completedProjectLoans}</span> finished
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Action Required</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{pendingActionCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <SidebarIcon name="clipboard" className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Critical pending tasks</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rejections</p>
                <p className="text-3xl font-bold text-rose-600 mt-1">{buyerLoans.filter(l => l.status === 'REJECTED').length}</p>
              </div>
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                <SidebarIcon name="lock" className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Applications declined</p>
          </div>
        </div>

        {/* Recent Applications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Applications Overview</h2>
            <div className="flex gap-2 p-1 bg-gray-50 rounded-lg">
              <button 
                onClick={() => setActiveTab('overall')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'overall' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveTab('buyer')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'buyer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Buyer
              </button>
              <button 
                onClick={() => setActiveTab('project')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'project' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Project
              </button>
            </div>
          </div>

          <div className="p-0">
            {activeTab === 'overall' && (
              <div className="divide-y divide-gray-50">
                {[...buyerLoans.slice(0, 5), ...projectLoans.slice(0, 5)]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((item, idx) => {
                    const isBuyer = 'lead' in item;
                    return (
                      <div key={idx} className="p-6 hover:bg-gray-50 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${isBuyer ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                            <SidebarIcon name={isBuyer ? 'person' : 'bank'} className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {isBuyer ? item.lead.name : item.project.name}
                            </p>
                            <p className="text-xs text-gray-500 font-medium mt-1">
                              {isBuyer ? `Loan: ${formatAmount(item.loanAmount)}` : `Bank: ${item.bank.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isBuyer ? getBuyerStatusColor(item.status) : getProjectStatusColor(item.reviewStatus)}`}>
                            {isBuyer ? item.status : item.reviewStatus}
                          </span>
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Link href={isBuyer ? '/loan-partner/buyer-loans' : '/loan-partner/project-loans'} className="p-2 text-gray-400 hover:text-blue-600 transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {activeTab === 'buyer' && (
              <div className="divide-y divide-gray-50">
                {buyerLoans.length === 0 ? (
                  <div className="p-20 text-center text-gray-400 font-medium">No buyer applications found</div>
                ) : (
                  buyerLoans.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">
                          <SidebarIcon name="person" className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.lead.name}</p>
                          <p className="text-xs text-gray-500 font-medium mt-1">Target: {formatAmount(item.loanAmount)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBuyerStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <Link href="/loan-partner/buyer-loans" className="p-2 text-gray-400 hover:text-indigo-600 transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'project' && (
              <div className="divide-y divide-gray-50">
                {projectLoans.length === 0 ? (
                  <div className="p-20 text-center text-gray-400 font-medium">No project reviews found</div>
                ) : (
                  projectLoans.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
                          <SidebarIcon name="bank" className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.project.name}</p>
                          <p className="text-xs text-gray-500 font-medium mt-1">Bank: {item.bank.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getProjectStatusColor(item.reviewStatus)}`}>
                          {item.reviewStatus}
                        </span>
                        <Link href="/loan-partner/project-loans" className="p-2 text-gray-400 hover:text-blue-600 transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {(buyerLoans.length > 0 || projectLoans.length > 0) && (
            <div className="bg-gray-50 p-4 text-center">
              <Link 
                href={activeTab === 'project' ? '/loan-partner/project-loans' : '/loan-partner/buyer-loans'} 
                className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
              >
                View Full Records
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

