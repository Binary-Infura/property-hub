'use client';

import React, { useState } from 'react';
import { chatService, ChatSessionResponse } from '../../services/chatService';
import ChatContainer from './ChatContainer';

interface ChatButtonProps {
    participantId: string;
    participantName: string;
    token: string;
    currentUserId: string;
    // Optional context
    propertyId?: string;
    leadId?: string;
    // Styling
    variant?: 'primary' | 'secondary' | 'icon';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function ChatButton({
    participantId,
    participantName,
    token,
    currentUserId,
    propertyId,
    leadId,
    variant = 'primary',
    size = 'md',
    className = '',
}: ChatButtonProps) {
    const [showChat, setShowChat] = useState(false);
    const [loading, setLoading] = useState(false);
    const [chatSession, setChatSession] = useState<ChatSessionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        if (showChat) {
            setShowChat(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const session = await chatService.startChat(participantId, token, { propertyId, leadId });
            setChatSession(session);
            setShowChat(true);
        } catch (err: any) {
            console.error('Failed to start chat:', err);
            setError(err.message || 'Failed to start chat');
        } finally {
            setLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const variantClasses = {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white border-transparent',
        secondary: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
        icon: 'bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2',
    };

    const buttonClasses = variant === 'icon'
        ? variantClasses.icon
        : `${sizeClasses[size]} ${variantClasses[variant]} inline-flex items-center gap-2 rounded-lg border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`;

    return (
        <>
            <button
                onClick={handleClick}
                disabled={loading}
                className={`${buttonClasses} ${className}`}
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg className={variant === 'icon' ? 'w-5 h-5' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
                {variant !== 'icon' && (
                    <span>{showChat ? 'Close Chat' : `Chat with ${participantName}`}</span>
                )}
            </button>

            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}

            {/* Chat modal/drawer */}
            {showChat && chatSession && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 transition-opacity"
                        onClick={() => setShowChat(false)}
                    />

                    {/* Chat panel */}
                    <div className="relative w-full max-w-lg h-[80vh] sm:h-[600px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">
                        <ChatContainer
                            token={token}
                            currentUserId={currentUserId}
                            initialParticipantId={participantId}
                            initialPropertyId={propertyId}
                            initialLeadId={leadId}
                            embedded={true}
                            className="h-full"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
