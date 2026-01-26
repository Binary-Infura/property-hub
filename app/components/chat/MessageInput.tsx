'use client';

import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../../services/chatService';

interface MessageInputProps {
    channelId: string;
    mattermostToken: string;
    mattermostUrl: string;
    onMessageSent?: () => void;
    disabled?: boolean;
}

export default function MessageInput({
    channelId,
    mattermostToken,
    mattermostUrl,
    onMessageSent,
    disabled = false,
}: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [message]);

    const handleSend = async () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || sending || disabled) return;

        try {
            setSending(true);
            await chatService.sendMessage(channelId, trimmedMessage, mattermostToken, mattermostUrl);
            setMessage('');
            onMessageSent?.();
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={disabled || sending}
                        rows={1}
                        className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={!message.trim() || sending || disabled}
                    className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {sending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                </button>
            </div>

            <p className="text-xs text-gray-400 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
            </p>
        </div>
    );
}
