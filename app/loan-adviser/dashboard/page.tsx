'use client';

import { useState } from 'react';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';
import NoAllocationPlaceholder from '@/app/components/dashboard/NoAllocationPlaceholder';

// Types
interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyValue: string;
  selectedProperty?: {
    id: string;
    title: string;
    location: string;
    price: string;
  };
}

interface FinancialDetails {
  monthlyIncome: string;
  creditScore: number;
  existingLiabilities: string;
  employmentType: 'salaried' | 'self-employed' | 'business';
  workExperience: string;
}

interface LoanApplication {
  id: string;
  userId: string;
  userName: string;
  propertyId?: string;
  propertyTitle?: string;
  loanAmount: string;
  loanType: 'home-loan' | 'balance-transfer' | 'top-up' | 'construction';
  status: 'eligibility-check' | 'document-collection' | 'document-verification' | 'bank-processing' | 'sanction-letter' | 'disbursement' | 'completed';
  stage: number; // 0-5 for journey stages
  eligibleAmount?: string;
  suggestedBanks: string[];
  selectedBank?: string;
  createdAt: string;
  lastUpdated: string;
  remarks?: string;
}

interface Document {
  id: string;
  loanApplicationId: string;
  name: string;
  category: 'identity' | 'income' | 'property' | 'legal' | 'bank';
  status: 'required' | 'uploaded' | 'verified' | 'rejected';
  uploadedDate?: string;
  rejectionReason?: string;
}

// Loan Journey Stages
const LOAN_JOURNEY_STAGES = [
  { id: 0, label: 'Eligibility Check', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>, description: 'Review financial details and calculate eligibility' },
  { id: 1, label: 'Document Collection', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>, description: 'Request and collect required documents' },
  { id: 2, label: 'Document Upload & Verification', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>, description: 'Verify uploaded documents' },
  { id: 3, label: 'Bank Processing', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>, description: 'Coordinate with bank for approval' },
  { id: 4, label: 'Sanction Letter', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>, description: 'Sanction letter issued' },
  { id: 5, label: 'Disbursement', svgIcon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>, description: 'Loan amount disbursed' },
] as const;

export default function LoanAdviserDashboard() {
  const { activeContext } = useUnifiedApp();
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'users'>('overview');

  // Mock data - in production, this would come from API/database
  const loanApplications: LoanApplication[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Rajesh Kumar',
      propertyId: 'prop1',
      propertyTitle: '3 BHK, Andheri',
      loanAmount: '₹45L',
      loanType: 'home-loan',
      status: 'document-verification',
      stage: 2,
      eligibleAmount: '₹65L',
      suggestedBanks: ['HDFC Bank', 'ICICI Bank', 'SBI'],
      selectedBank: 'HDFC Bank',
      createdAt: '2024-01-15',
      lastUpdated: '2024-01-20',
      remarks: 'Documents under review. Waiting for salary slips verification.',
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Priya Sharma',
      propertyId: 'prop2',
      propertyTitle: '2 BHK, Bandra',
      loanAmount: '₹52L',
      loanType: 'home-loan',
      status: 'bank-processing',
      stage: 3,
      eligibleAmount: '₹70L',
      suggestedBanks: ['Axis Bank', 'Kotak Mahindra'],
      selectedBank: 'Axis Bank',
      createdAt: '2024-01-10',
      lastUpdated: '2024-01-22',
      remarks: 'All documents verified. Application submitted to bank.',
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Arun Patel',
      propertyId: 'prop3',
      propertyTitle: '4 BHK, Powai',
      loanAmount: '₹80L',
      loanType: 'home-loan',
      status: 'eligibility-check',
      stage: 0,
      eligibleAmount: '₹75L',
      suggestedBanks: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'],
      createdAt: '2024-01-25',
      lastUpdated: '2024-01-25',
    },
  ];

  const users: (User & { financialDetails: FinancialDetails })[] = [
    {
      id: 'user1',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh@example.com',
      propertyValue: '₹45L',
      selectedProperty: {
        id: 'prop1',
        title: '3 BHK, Andheri',
        location: 'Andheri, Mumbai',
        price: '₹45L',
      },
      financialDetails: {
        monthlyIncome: '₹1.2L',
        creditScore: 750,
        existingLiabilities: '₹15L (car loan)',
        employmentType: 'salaried',
        workExperience: '8 years',
      },
    },
    {
      id: 'user2',
      name: 'Priya Sharma',
      phone: '+91 98765 43211',
      email: 'priya@example.com',
      propertyValue: '₹52L',
      selectedProperty: {
        id: 'prop2',
        title: '2 BHK, Bandra',
        location: 'Bandra, Mumbai',
        price: '₹52L',
      },
      financialDetails: {
        monthlyIncome: '₹1.5L',
        creditScore: 780,
        existingLiabilities: 'None',
        employmentType: 'salaried',
        workExperience: '10 years',
      },
    },
    {
      id: 'user3',
      name: 'Arun Patel',
      phone: '+91 98765 43212',
      email: 'arun@example.com',
      propertyValue: '₹80L',
      selectedProperty: {
        id: 'prop3',
        title: '4 BHK, Powai',
        location: 'Powai, Mumbai',
        price: '₹80L',
      },
      financialDetails: {
        monthlyIncome: '₹2L',
        creditScore: 720,
        existingLiabilities: '₹25L (home loan)',
        employmentType: 'self-employed',
        workExperience: '12 years',
      },
    },
  ];

  const documents: Document[] = [
    { id: 'doc1', loanApplicationId: '1', name: 'Aadhaar Card', category: 'identity', status: 'verified', uploadedDate: '2024-01-16' },
    { id: 'doc2', loanApplicationId: '1', name: 'PAN Card', category: 'identity', status: 'verified', uploadedDate: '2024-01-16' },
    { id: 'doc3', loanApplicationId: '1', name: 'Salary Slips (Last 3 months)', category: 'income', status: 'uploaded', uploadedDate: '2024-01-18' },
    { id: 'doc4', loanApplicationId: '1', name: 'Bank Statements (Last 6 months)', category: 'income', status: 'required' },
    { id: 'doc5', loanApplicationId: '1', name: 'Property Documents', category: 'property', status: 'required' },
  ];

  const getStatusColor = (status: LoanApplication['status']) => {
    const colors: Record<LoanApplication['status'], string> = {
      'eligibility-check': 'bg-gray-100 text-gray-700',
      'document-collection': 'bg-blue-100 text-blue-700',
      'document-verification': 'bg-yellow-100 text-yellow-700',
      'bank-processing': 'bg-purple-100 text-purple-700',
      'sanction-letter': 'bg-green-100 text-green-700',
      'disbursement': 'bg-emerald-100 text-emerald-700',
      'completed': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: LoanApplication['status']) => {
    const labels: Record<LoanApplication['status'], string> = {
      'eligibility-check': 'Eligibility Check',
      'document-collection': 'Document Collection',
      'document-verification': 'Document Verification',
      'bank-processing': 'Bank Processing',
      'sanction-letter': 'Sanction Letter',
      'disbursement': 'Disbursement',
      'completed': 'Completed',
    };
    return labels[status];
  };

  const selectedLoanData = loanApplications.find(loan => loan.id === selectedLoan);
  const selectedUserData = selectedLoanData ? users.find(u => u.id === selectedLoanData.userId) : null;
  const selectedLoanDocuments = selectedLoanData ? documents.filter(d => d.loanApplicationId === selectedLoanData.id) : [];

  // Stats
  const totalLoans = loanApplications.length;
  const activeLoans = loanApplications.filter(l => l.status !== 'completed').length;
  const pendingDocuments = documents.filter(d => d.status === 'required' || d.status === 'uploaded').length;
  const approvedLoans = loanApplications.filter(l => l.status === 'sanction-letter' || l.status === 'disbursement' || l.status === 'completed').length;

  if (!activeContext.activeCity) {
    return <NoAllocationPlaceholder />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Loan Adviser Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage loan applications and guide users through the loan journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Total Loans</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{totalLoans}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Active Loans</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{activeLoans}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Pending Documents</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingDocuments}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600 text-sm font-medium">Approved/Sanctioned</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{approvedLoans}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Loan Applications List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Loan Applications
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                Assigned Users
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {loanApplications.map((loan) => (
                    <div
                      key={loan.id}
                      onClick={() => setSelectedLoan(loan.id)}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition ${selectedLoan === loan.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{loan.userName}</h3>
                          {loan.propertyTitle && (
                            <p className="text-sm text-gray-600 mt-1">{loan.propertyTitle}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {getStatusLabel(loan.status)}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Loan Amount</p>
                          <p className="text-lg font-semibold text-gray-900">{loan.loanAmount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Eligible Amount</p>
                          <p className="text-lg font-semibold text-green-600">{loan.eligibleAmount || 'Calculating...'}</p>
                        </div>
                        {loan.selectedBank && (
                          <div>
                            <p className="text-xs text-gray-500">Selected Bank</p>
                            <p className="text-sm font-medium text-gray-900">{loan.selectedBank}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500">Last Updated</p>
                          <p className="text-sm text-gray-600">{loan.lastUpdated}</p>
                        </div>
                      </div>

                      {/* Loan Journey Progress */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-700">Progress</span>
                          <span className="text-xs text-gray-500">{Math.round((loan.stage / 5) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${(loan.stage / 5) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2">
                          {LOAN_JOURNEY_STAGES.slice(0, 3).map((stage) => (
                            <span
                              key={stage.id}
                              className={`text-xs ${stage.id <= loan.stage ? 'text-blue-600' : 'text-gray-400'
                                }`}
                            >
                              {stage.svgIcon}
                            </span>
                          ))}
                        </div>
                      </div>

                      {loan.remarks && (
                        <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">Remarks</p>
                          <p className="text-sm text-gray-600">{loan.remarks}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="p-6 rounded-lg border border-gray-200 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{user.phone}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        {user.selectedProperty && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Selected Property</p>
                            <p className="text-sm font-medium text-gray-900">{user.selectedProperty.title}</p>
                            <p className="text-xs text-gray-600">{user.selectedProperty.location}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Monthly Income</p>
                          <p className="text-sm font-semibold text-gray-900">{user.financialDetails.monthlyIncome}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Credit Score</p>
                          <p className="text-sm font-semibold text-gray-900">{user.financialDetails.creditScore}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Employment</p>
                          <p className="text-sm text-gray-900">{user.financialDetails.employmentType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Liabilities</p>
                          <p className="text-sm text-gray-900">{user.financialDetails.existingLiabilities || 'None'}</p>
                        </div>
                      </div>

                      <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition">
                        View Loan Application
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Details Panel */}
        {selectedLoanData && (
          <div className="space-y-6">
            {/* Loan Journey Stages */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Loan Journey</h2>
              <div className="space-y-4">
                {LOAN_JOURNEY_STAGES.map((stage, index) => {
                  const isActive = index === selectedLoanData.stage;
                  const isCompleted = index < selectedLoanData.stage;
                  return (
                    <div key={stage.id} className="flex gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold transition ${isCompleted
                        ? 'bg-green-100 text-green-600'
                        : isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-400'
                        }`}>
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        ) : stage.svgIcon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                          {stage.label}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
                        {isActive && (
                          <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition">
                            Update Status
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Details */}
            {selectedUserData && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Income</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUserData.financialDetails.monthlyIncome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Credit Score</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUserData.financialDetails.creditScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Employment Type</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">{selectedUserData.financialDetails.employmentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Work Experience</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUserData.financialDetails.workExperience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Existing Liabilities</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedUserData.financialDetails.existingLiabilities || 'None'}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-900">Eligible Amount</span>
                      <span className="text-lg font-bold text-green-600">{selectedLoanData.eligibleAmount || 'Calculating...'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Banks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Bank Options</h2>
              <div className="space-y-3">
                {selectedLoanData.suggestedBanks.map((bank, index) => (
                  <div
                    key={bank}
                    className={`p-3 rounded-lg border-2 ${selectedLoanData.selectedBank === bank
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{bank}</p>
                        <p className="text-xs text-gray-600 mt-1">Interest Rate: 8.5% - 9.2%</p>
                      </div>
                      {selectedLoanData.selectedBank === bank ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Selected</span>
                      ) : (
                        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition">
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Documents</h2>
                <span className="text-xs text-gray-600">
                  {selectedLoanDocuments.filter(d => d.status === 'verified').length}/{selectedLoanDocuments.length} verified
                </span>
              </div>
              <div className="space-y-3">
                {selectedLoanDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${doc.status === 'verified'
                        ? 'bg-green-100 text-green-600'
                        : doc.status === 'uploaded'
                          ? 'bg-blue-100 text-blue-600'
                          : doc.status === 'rejected'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                        {doc.status === 'verified' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : doc.status === 'uploaded' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        ) : doc.status === 'rejected' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        {doc.uploadedDate && (
                          <p className="text-xs text-gray-500">{doc.uploadedDate}</p>
                        )}
                        {doc.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">{doc.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                    {doc.status === 'uploaded' && (
                      <div className="flex gap-2">
                        <button className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition">
                          Verify
                        </button>
                        <button className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">
                  Update Loan Status
                </button>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition">
                  Send Communication
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">
                  Add Remarks
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">
                  Coordinate with Bank
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedLoanData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>
            </div>
            <p className="text-gray-600">Select a loan application to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

