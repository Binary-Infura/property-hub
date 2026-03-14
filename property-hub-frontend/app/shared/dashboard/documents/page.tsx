'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { userService } from '@/app/services/userService';
import { uploadService } from '@/app/services/uploadService';

interface Document {
    id: string;
    name: string;
    category: 'identity' | 'income' | 'property' | 'legal';
    status: 'required' | 'uploaded' | 'verified';
    uploadedDate?: string;
    file?: File;
    fileUrl?: string;
}

export default function DocumentManagementPage() {
    const { token, user, initialized, authenticated } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [documents, setDocuments] = useState<Document[]>([
        { id: '1', name: 'Aadhaar Card', category: 'identity', status: 'required' },
        { id: '2', name: 'PAN Card', category: 'identity', status: 'required' },
        { id: '3', name: 'Salary Slips (Last 3 months)', category: 'income', status: 'required' },
        { id: '4', name: 'Bank Statements (Last 6 months)', category: 'income', status: 'required' },
        { id: '5', name: 'Property Documents', category: 'property', status: 'required' },
        { id: '6', name: 'Legal Verification Report', category: 'legal', status: 'required' },
    ]);

    useEffect(() => {
        const syncDocuments = async () => {
            if (!token) return;

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                console.log('[DocumentSync] Fetching from /api/users/me/documents ...');

                const res = await fetch(`${API_URL}/api/users/me/documents`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    console.error('[DocumentSync] API error:', res.status);
                    return;
                }

                const savedDocs: any[] = await res.json();
                console.log(`[DocumentSync] Got ${savedDocs.length} documents from backend:`, savedDocs.map(d => d.name));

                if (savedDocs.length > 0) {
                    setDocuments(prev => prev.map(doc => {
                        const savedDoc = savedDocs.find(d =>
                            d.category?.toString().trim().toLowerCase() === doc.category.trim().toLowerCase() &&
                            d.name?.toString().trim().toLowerCase() === doc.name.trim().toLowerCase()
                        );
                        if (savedDoc) {
                            console.log(`[DocumentSync] Matched: ${doc.name} → status: ${savedDoc.status}`);
                            return {
                                ...doc,
                                status: savedDoc.status as any,
                                uploadedDate: savedDoc.createdAt ? savedDoc.createdAt.toString().split('T')[0] : undefined,
                                fileUrl: savedDoc.url
                            };
                        }
                        return doc;
                    }));
                }
            } catch (e) {
                console.error('[DocumentSync] Error:', e);
            }
        };

        if (initialized) {
            syncDocuments();
        }
    }, [token, initialized, authenticated]);

    const [activeTab, setActiveTab] = useState<'all' | 'identity' | 'income' | 'property' | 'legal'>('all');

    const filteredDocuments = activeTab === 'all'
        ? documents
        : documents.filter(d => d.category === activeTab);

    const handleFileUpload = async (id: string, file: File) => {
        if (!token) return;

        try {
            setDocuments(prevDocs => prevDocs.map(doc =>
                doc.id === id ? { ...doc, status: 'uploaded' } : doc
            ));

            const targetDoc = documents.find(d => d.id === id);
            if (!targetDoc) return;

            const fileUrl = await uploadService.uploadFile(file, token, targetDoc.category, targetDoc.name);

            setDocuments(prevDocs => prevDocs.map(doc =>
                doc.id === id
                    ? { ...doc, status: 'uploaded', uploadedDate: new Date().toISOString().split('T')[0], fileUrl }
                    : doc
            ));
            alert(`File "${file.name}" uploaded successfully!`);
        } catch (error: any) {
            console.error("Upload failed:", error);
            alert(error.message || "Upload failed. Please try again.");
            setDocuments(prevDocs => prevDocs.map(doc =>
                doc.id === id ? { ...doc, status: 'required' } : doc
            ));
        }
    };

    const getStatusBadge = (status: Document['status']) => {
        if (status === 'required') {
            return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>Required</span>;
        } else {
            return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>Uploaded</span>;
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Portfolio Management</h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide">Manage and secure your critical property documents.</p>
                </div>
                <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto w-full md:w-auto">
                    {['all', 'identity', 'income', 'property', 'legal'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-xl shadow-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6">
                {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-slate-100/50 hover:scale-[1.01] transition-all duration-500 hover:border-blue-200">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center shrink-0 ${doc.status === 'required' ? 'bg-slate-50 text-slate-300' : 'bg-green-50 text-green-600'}`}>
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{doc.name}</h3>
                                        {getStatusBadge(doc.status)}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                        <span className="text-blue-600/60">{doc.category}</span>
                                        {doc.uploadedDate && (
                                            <>
                                                <span>•</span>
                                                <span>Modified {doc.uploadedDate}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                {doc.status !== 'required' ? (
                                    <>
                                        <button
                                            onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}
                                            className="flex-1 md:flex-none px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition hover:bg-slate-900 hover:text-white group-hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!doc.fileUrl}
                                        >
                                            View Securely
                                        </button>
                                        <button
                                            onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}
                                            className="flex-1 md:flex-none p-4 bg-slate-50 text-slate-400 rounded-2xl transition hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!doc.fileUrl}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        </button>
                                    </>
                                ) : (
                                    <label className="flex-1 md:flex-none px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest transition shadow-2xl shadow-blue-200 hover:bg-blue-700 cursor-pointer active:scale-95 text-center">
                                        Upload Now
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(doc.id, file);
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-20 p-12 bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 text-center">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.25rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Bank-Grade Encryption</h2>
                <p className="text-slate-400 font-bold max-w-sm mx-auto mb-10 text-lg leading-relaxed">Your documents are secured with AES-256 bit encryption and only visible to authorized financial consultants.</p>
                <div className="flex flex-wrap justify-center gap-12 text-slate-300 font-black text-[10px] uppercase tracking-widest opacity-60">
                    <span className="px-4 py-2 border border-slate-200 rounded-lg">PCI DSS Compliant</span>
                    <span className="px-4 py-2 border border-slate-200 rounded-lg">ISO 27001 Certified</span>
                    <span className="px-4 py-2 border border-slate-200 rounded-lg">AES-256 Encrypted</span>
                </div>
            </div>
        </div>
    );
}
