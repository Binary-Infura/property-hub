'use client';

import { useState } from 'react';
import PropertyCard from '@/app/components/PropertyCard';

interface PropertyDocument {
  id: string;
  name: string;
  category: 'identity' | 'income' | 'property' | 'legal';
  status: 'required' | 'uploaded' | 'verified';
  uploadedDate?: string;
}

export default function BuyerDashboard() {
  const [expandedProperty, setExpandedProperty] = useState<number | null>(null);

  // Property Recommendations
  const recommendedProperties = [
    {
      id: 1,
      price: "₹45L",
      config: "3 BHK",
      location: "Andheri, Mumbai",
      area: "1500 sqft",
      age: "5-year old",
      badge: "Perfect Match",
      badgeColor: "bg-green-100 text-green-700",
      bestFor: "Growing families seeking top schools and community",
      budgetRange: "₹40L - ₹60L",
      reason: "Matches your budget with excellent school connectivity for families. High appreciation potential in this locality.",
      highlights: ["Family-friendly location", "Top-rated schools nearby", "Good resale value", "Modern amenities"],
      consultantNote: "This property checks all your boxes—budget, location, and family needs. The area has strong appreciation with excellent community infrastructure.",
      consultant: {
        name: "Rajesh Sharma",
        initials: "RS",
        rating: 4.9,
        deals: 50,
        role: "Senior Consultant"
      }
    },
    {
      id: 2,
      price: "₹52L",
      config: "2 BHK",
      location: "Bandra, Mumbai",
      area: "1200 sqft",
      age: "3-year old",
      badge: "High Demand",
      badgeColor: "bg-blue-100 text-blue-700",
      bestFor: "Investors looking for premium rental yields",
      budgetRange: "₹50L - ₹60L",
      reason: "Premium location with strong investment potential. Delivers 4.5% annual rental yield with capital appreciation.",
      highlights: ["4.5% annual rental yield", "Prime investment location", "High demand area", "Strong appreciation"],
      consultantNote: "As an investment property, this shows strong growth trajectory in an upmarket area. Excellent for long-term wealth creation.",
      consultant: {
        name: "Priya Kapoor",
        initials: "PK",
        rating: 4.8,
        deals: 35,
        role: "Investment Specialist"
      }
    },
  ];

  // Documents
  const documents: PropertyDocument[] = [
    { id: '1', name: 'Aadhaar Card', category: 'identity', status: 'verified', uploadedDate: '2024-01-15' },
    { id: '2', name: 'PAN Card', category: 'identity', status: 'verified', uploadedDate: '2024-01-15' },
    { id: '3', name: 'Salary Slips (Last 3 months)', category: 'income', status: 'uploaded', uploadedDate: '2024-01-20' },
    { id: '4', name: 'Bank Statements (Last 6 months)', category: 'income', status: 'uploaded', uploadedDate: '2024-01-20' },
    { id: '5', name: 'Property Documents', category: 'property', status: 'required' },
    { id: '6', name: 'Legal Verification Report', category: 'legal', status: 'required' },
  ];

  const uploadedCount = documents.filter(d => d.status === 'uploaded' || d.status === 'verified').length;
  const requiredCount = documents.filter(d => d.status === 'required').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Welcome & Stats */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200">
            <h1 className="text-4xl font-black tracking-tighter mb-4">Good Evening, Partner</h1>
            <p className="text-blue-100 font-bold mb-8 opacity-80 max-w-md">Your property journey is progressing. We've curated new matches based on your latest activity.</p>
            <div className="flex flex-wrap gap-4">
              <a href="/dashboard/search" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-50 transition active:scale-95">
                Explore Market
              </a>
              <a href="/dashboard/saved" className="bg-blue-500/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/30 transition active:scale-95">
                View Shortlist
              </a>
            </div>
          </div>

          {/* 2. Property Recommendations */}
          <div>
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Curated For You</h2>
              <div className="flex gap-3">
                <a
                  href="/dashboard/search"
                  className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition shadow-sm active:scale-95"
                >
                  Discovery Hub →
                </a>
              </div>
            </div>
            <div className="space-y-6">
              {recommendedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isExpanded={expandedProperty === property.id}
                  onToggleExpand={(id) => setExpandedProperty(id === expandedProperty ? null : id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* 3. Loan Status Quick View */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-50 p-8 hover:scale-[1.02] transition-transform duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Financing</h2>
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-[1.75rem] border border-slate-100 mb-6 font-black">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Active Loan Applications</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl text-slate-900">02</p>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-lg uppercase tracking-widest">In Progress</span>
              </div>
            </div>
            <a href="/dashboard/loan" className="w-full inline-block text-center py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition active:scale-95">
              Manage Financing →
            </a>
          </div>

          {/* 4. Document Management Quick View */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-50 p-8 hover:scale-[1.02] transition-transform duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Portfolio</h2>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">
                {uploadedCount}/{documents.length} Secure
              </span>
            </div>
            <div className="space-y-3 mb-6">
              {documents.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{doc.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <a href="/dashboard/documents" className="w-full inline-block text-center py-4 border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition active:scale-95">
              Secure Upload
            </a>
          </div>

          {/* 5. Legal Verification Quick View */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-50 p-8 hover:scale-[1.02] transition-transform duration-500">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Legal Desk</h2>
            <div className="p-6 bg-blue-50/50 rounded-[1.75rem] border border-blue-100 mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clearance Report</p>
              <p className="text-xs font-bold text-slate-900 mb-3">Sunset Towers Verified</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl transition active:scale-95">
              View All Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
