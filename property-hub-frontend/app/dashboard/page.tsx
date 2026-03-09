'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '@/app/components/PropertyCard';
import { propertyService } from '@/app/services/propertyService';
import { loanService } from '@/app/services/loanService';
import { useAuth } from '@/app/contexts/AuthContext';
import { useConsultingBucket } from '@/app/contexts/ConsultingBucketContext';


interface PropertyDocument {
  id: string;
  name: string;
  category: 'identity' | 'income' | 'property' | 'legal';
  status: 'required' | 'uploaded' | 'verified';
  uploadedDate?: string;
}

export default function BuyerDashboard() {
  const { token, user, initialized } = useAuth();
  const { items, removeItem } = useConsultingBucket();
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [recommendedProperties, setRecommendedProperties] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const loansData = token ? await loanService.getLoans(token).catch(() => []) : [];
        setLoans(loansData);

        if (items.length === 0) {
          setRecommendedProperties([]);
          return;
        }

        const details = await Promise.all(
          items.slice(0, 3).map(async (item) => {
            try {
              const p = await propertyService.getOne(item.id, token || null);
              return {
                id: p.id,
                price: `₹${(Number(p.price) / 100000).toFixed(1)}L`,
                config: `${p.bedrooms || 2} BHK`,
                location: p.location,
                area: `${p.area || 1200} sqft`,
                age: "New",
                badge: p.status === 'APPROVED' ? "Verified" : "New Launch",
                badgeColor: p.status === 'APPROVED' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700",
                bestFor: p.projectType === 'PLOT' || p.projectType === 'COMMERCIAL' ? "Investors" : "Families",
                budgetRange: `₹${(Number(p.price) / 110000).toFixed(0)}L - ₹${(Number(p.price) / 90000).toFixed(0)}L`,
                reason: "Matches your profile expectations in this high-growth corridor.",
                highlights: ["Legal Verified", "Modern Amenities", "Prime Location"],
                consultantNote: "A premium opportunity with excellent connectivity and infrastructure development.",
                consultant: {
                  name: "Rajesh Sharma",
                  initials: "RS",
                  rating: 4.8,
                  deals: 35,
                  role: "Senior Consultant"
                }
              };
            } catch (e) {
              return null;
            }
          })
        );

        setRecommendedProperties(details.filter(d => d !== null));
        setLoans(loansData);


      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user?.userId, items]);

  // Fetch real documents from backend
  useEffect(() => {
    const fetchDocs = async () => {
      if (!token) return;
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_URL}/api/users/me/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const docs = await res.json();
          setUserDocuments(docs);
        }
      } catch (e) {
        console.error('Failed to fetch user documents:', e);
      }
    };
    if (initialized) fetchDocs();
  }, [token, initialized]);

  // All 6 document slots
  const allDocSlots = [
    { id: '1', name: 'Aadhaar Card', category: 'identity' },
    { id: '2', name: 'PAN Card', category: 'identity' },
    { id: '3', name: 'Salary Slips (Last 3 months)', category: 'income' },
    { id: '4', name: 'Bank Statements (Last 6 months)', category: 'income' },
    { id: '5', name: 'Property Documents', category: 'property' },
    { id: '6', name: 'Legal Verification Report', category: 'legal' },
  ];

  const documents = allDocSlots.map(slot => {
    const saved = userDocuments.find(d =>
      d.category?.toLowerCase() === slot.category.toLowerCase() &&
      d.name?.toLowerCase() === slot.name.toLowerCase()
    );
    return {
      ...slot,
      status: saved ? (saved.status as 'uploaded' | 'verified') : 'required' as const,
      uploadedDate: saved?.createdAt?.split('T')[0],
      fileUrl: saved?.url,
    };
  });

  const uploadedCount = documents.filter(d => d.status === 'uploaded' || d.status === 'verified').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Welcome & Stats */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200">
            <h1 className="text-4xl font-black tracking-tighter mb-4">Welcome Back, {user?.firstName || 'Partner'}</h1>
            <p className="text-blue-100 font-bold mb-8 opacity-80 max-w-md">Your property journey is progressing. You have {items.length} properties saved in your shortlist.</p>
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
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Saved Properties</h2>
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
              {recommendedProperties.length > 0 ? (
                recommendedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isExpanded={expandedProperty === property.id}
                    onToggleExpand={(id) => setExpandedProperty(id === expandedProperty ? null : id as any)}
                  />
                ))
              ) : (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-100">
                  <p className="text-slate-400 font-bold">No saved properties yet.</p>
                </div>
              )}
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
                <p className="text-2xl text-slate-900">{loans.length.toString().padStart(2, '0')}</p>
                {loans.length > 0 && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-lg uppercase tracking-widest">In Progress</span>
                )}
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
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${uploadedCount === documents.length ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {uploadedCount}/{documents.length} Secure
              </span>
            </div>
            <div className="space-y-3 mb-6">
              {documents.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.status !== 'required'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-slate-200 text-slate-400'
                      }`}>
                      {doc.status !== 'required' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col items-start gap-1 p-1">
                      <span className="text-xs font-bold text-slate-700 truncate block max-w-[110px]">{doc.name}</span>
                      {doc.status !== 'required' && (
                        <span className="text-[9px] font-bold uppercase tracking-wide text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          Uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <a href="/dashboard/documents" className="w-full inline-block text-center py-4 border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition active:scale-95">
              {uploadedCount < documents.length ? 'Secure Upload' : 'View Documents'}
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
