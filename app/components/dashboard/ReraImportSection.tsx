'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { reraService } from '@/app/services/reraService';
import { State } from 'country-state-city';

export default function ReraImportSection() {
    const { token } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [selectedState, setSelectedState] = useState('Maharashtra');
    const [statesList, setStatesList] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        // Fetch states for India (IN)
        const indiaStates = State.getStatesOfCountry('IN');
        setStatesList(indiaStates);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !token) return;

        setUploading(true);
        setMessage(null);

        try {
            const result = await reraService.uploadData(token, file, selectedState);
            setMessage({
                type: 'success',
                text: `Successfully processed ${result.processed} projects for ${selectedState}.`
            });
            setFile(null);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to upload RERA data' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">Manual Data Import</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Scraper-to-Portal Bridge</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Target State</label>
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                        >
                            {statesList.map((state) => (
                                <option key={state.isoCode} value={state.name}>
                                    {state.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Select NDJSON File</label>
                        <input
                            type="file"
                            accept=".ndjson"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer border border-gray-200 p-2 rounded-xl bg-white"
                        />
                    </div>
                </div>

                <div>
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all transform active:scale-95 flex items-center justify-center gap-2 ${!file || uploading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200'
                            }`}
                    >
                        {uploading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {uploading ? 'Processing...' : 'Run Import Process'}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mt-6 p-4 rounded-xl border text-sm font-medium animate-in slide-in-from-top-2 ${message.type === 'success'
                    ? 'bg-green-50 border-green-100 text-green-700'
                    : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        {message.text}
                    </div>
                </div>
            )}
        </div>
    );
}
