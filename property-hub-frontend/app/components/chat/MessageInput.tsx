'use client';

import React, { useState } from 'react';

interface MessageInputProps {
    onMessageSent?: () => void;
    disabled?: boolean;
}

export default function MessageInput({
    onMessageSent,
    disabled = true,
}: MessageInputProps) {
    const [message, setMessage] = useState('');

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Chat messaging feature is currently disabled"
                        disabled={true}
                        rows={1}
                        className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                </div>

                <button
                    disabled={true}
                    className="flex-shrink-0 w-11 h-11 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center cursor-not-allowed transition-colors duration-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
