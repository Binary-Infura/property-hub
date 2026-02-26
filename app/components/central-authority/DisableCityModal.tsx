'use client';

import React, { useState } from 'react';

interface DisableCityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    cityName: string;
    cityCode: string;
}

export default function DisableCityModal({ isOpen, onClose, onConfirm, cityName, cityCode }: DisableCityModalProps) {
    const [inputCode, setInputCode] = useState('');

    if (!isOpen) return null;

    const isMatch = inputCode === cityCode;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Disable City?</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        To disable <span className="font-bold text-gray-900">{cityName}</span>, please enter the city code <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-bold">{cityCode}</span> below.
                    </p>

                    <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="Enter city code"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-center font-mono text-sm mb-6"
                        autoFocus
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setInputCode('');
                                onClose();
                            }}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                setInputCode('');
                                onConfirm();
                            }}
                            disabled={!isMatch}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${isMatch
                                ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Disable City
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
