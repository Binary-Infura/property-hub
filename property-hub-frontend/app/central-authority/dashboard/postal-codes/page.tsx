'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface PostalCode {
    id: string;
    code: string;
    officeName: string;
    officeType: string;
    delivery: string;
    district: string;
    stateName: string;
    latitude: string;
    longitude: string;
}

interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function PostalCodesPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [postalCodes, setPostalCodes] = useState<PostalCode[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState<{ imported: number, total: number, isSyncing: boolean } | null>(null);
    const [syncMessage, setSyncMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [syncLogs, setSyncLogs] = useState<any[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const fetchSyncLogs = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/postal-codes/sync/logs?limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSyncLogs(data);
            }
        } catch (e) {
            console.error('Failed to fetch sync logs:', e);
        }
    };

    const fetchPostalCodes = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/postal-codes?page=${page}&limit=50&search=${search}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setPostalCodes(data.items);
                setMeta(data.meta);
            }
        } catch (error) {
            console.error('Failed to fetch postal codes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(fetchPostalCodes, 500);
        return () => clearTimeout(timeoutId);
    }, [token, page, search, API_URL]);

    useEffect(() => {
        fetchSyncLogs();
    }, [token, API_URL]);

    // Poll for sync progress
    useEffect(() => {
        let intervalId: any;
        if (isSyncing) {
            intervalId = setInterval(async () => {
                try {
                    const response = await fetch(`${API_URL}/api/postal-codes/sync/progress`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setSyncProgress(data);
                        if (!data.isSyncing) {
                            setIsSyncing(false);
                            fetchPostalCodes();
                            fetchSyncLogs();
                        }
                    }
                } catch (e) {
                    console.error('Progress poll error:', e);
                }
            }, 2000);
        }
        return () => clearInterval(intervalId);
    }, [isSyncing, token, API_URL]);

    const handleFullSync = async () => {
        if (!token) return;
        setIsSyncing(true);
        setSyncMessage(null);
        try {
            const response = await fetch(`${API_URL}/api/postal-codes/sync/full`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                setSyncMessage({ text: 'Failed to start full sync.', type: 'error' });
                setIsSyncing(false);
            }
        } catch (error) {
            console.error('Sync error:', error);
            setSyncMessage({ text: 'An error occurred during synchronization.', type: 'error' });
            setIsSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Postal Codes</h1>
                    <p className="text-gray-500 text-sm">Manage and view all postal code data across the platform.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleFullSync}
                        disabled={isSyncing}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm ${isSyncing
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isSyncing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                Syncing All...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Sync All from Gov API
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        Back
                    </button>
                </div>
            </div>

            {isSyncing && syncProgress && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 animate-pulse">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-blue-700">Full Sync in Progress...</span>
                        <span className="text-xs font-bold text-blue-500">
                            {syncProgress.imported.toLocaleString()} / {syncProgress.total.toLocaleString()} records
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${(syncProgress.imported / (syncProgress.total || 1)) * 100}%` }}
                        ></div>
                    </div>
                    <p className="mt-2 text-[10px] text-gray-400 italic">This may take several minutes. You can continue using other parts of the dashboard.</p>
                </div>
            )}

            {syncMessage && (
                <div className={`p-4 rounded-lg flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${syncMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    <div className="flex items-center gap-2">
                        {syncMessage.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <span className="text-sm font-medium">{syncMessage.text}</span>
                    </div>
                    <button onClick={() => setSyncMessage(null)} className="text-current opacity-50 hover:opacity-100">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l18 18" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Total Synchronized</h3>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-slate-900">{meta?.total.toLocaleString() || '0'}</span>
                        <span className="text-sm text-gray-400 mb-1">Postal Codes</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Current Search</h3>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-slate-900">{postalCodes.length}</span>
                        <span className="text-sm text-gray-400 mb-1">Results Found</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Recent History</h3>
                    <div className="mt-2 space-y-1">
                        {syncLogs.length > 0 ? (
                            syncLogs.slice(0, 2).map((log: any) => (
                                <div key={log.id} className="flex items-center justify-between text-[10px] text-gray-500">
                                    <span className="truncate max-w-[100px]">{new Date(log.startedAt).toLocaleDateString()}</span>
                                    <span className={`font-bold ${log.status === 'COMPLETED' ? 'text-green-500' : 'text-blue-500'}`}>
                                        {log.status === 'COMPLETED' ? 'Success' : log.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <span className="text-[10px] text-gray-400">No recent logs</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by code, office, district or state..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-wider border-y border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Pincode</th>
                                <th className="px-6 py-4">Office Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">District</th>
                                <th className="px-6 py-4">State</th>
                                <th className="px-6 py-4">Delivery</th>
                                <th className="px-6 py-4">Coordinates</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && postalCodes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                            <span className="text-gray-400">Loading data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : postalCodes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400 italic">
                                        No postal codes found.
                                    </td>
                                </tr>
                            ) : (
                                postalCodes.map((pc: any) => (
                                    <tr key={pc.id} className="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                                        <td className="px-6 py-4 font-bold text-slate-900">{pc.code}</td>
                                        <td className="px-6 py-4 font-medium text-gray-700">{pc.officeName}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                                                {pc.officeType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{pc.district}</td>
                                        <td className="px-6 py-4">{pc.stateName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${pc.delivery === 'Delivery'
                                                ? 'bg-green-50 text-green-700 border border-green-100'
                                                : 'bg-orange-50 text-orange-700 border border-orange-100'
                                                }`}>
                                                {pc.delivery}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[11px] text-gray-400 font-mono">
                                            {pc.latitude && pc.longitude ? `${pc.latitude}, ${pc.longitude}` : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {meta && meta.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                        <div className="text-sm text-gray-500">
                            Showing page <span className="font-semibold text-gray-900">{meta.page}</span> of <span className="font-semibold text-gray-900">{meta.totalPages}</span>
                            <span className="ml-4 text-xs">Total records: {meta.total}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sync Logs Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Sync History & Audit Log</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-wider border-y border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Started At</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Imported</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Error</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {syncLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-400">No sync history available.</td>
                                </tr>
                            ) : (
                                syncLogs.map((log: any) => (
                                    <tr key={log.id} className="text-xs hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(log.startedAt).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded font-bold ${log.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                                                    log.status === 'FAILED' ? 'bg-red-50 text-red-700' :
                                                        'bg-blue-50 text-blue-700 animate-pulse'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono">{log.recordsImported.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono">{log.totalRecords.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-red-400 italic truncate max-w-xs">{log.error || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
