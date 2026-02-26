'use client';

import React from 'react';
import { ChatParticipant } from '../../services/chatService';

interface ChatHeaderProps {
    participants: ChatParticipant[];
    currentUserId: string;
    contextType?: string;
    contextId?: string;
    onClose?: () => void;
    onBack?: () => void;
}

const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
        buyer: 'bg-green-100 text-green-800',
        consultant: 'bg-blue-100 text-blue-800',
        'property-partner': 'bg-orange-100 text-orange-800',
        'channel-partner': 'bg-yellow-100 text-yellow-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
};

const formatRole = (role: string) => {
    return role
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function ChatHeader({
    participants,
    currentUserId,
    contextType,
    contextId,
    onClose,
    onBack,
}: ChatHeaderProps) {
    const otherParticipant = participants.find(p => p.id !== currentUserId);

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            {/* Back button for mobile */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            {/* Avatar */}
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {otherParticipant?.name || 'Unknown'}
                    </h3>
                    {otherParticipant && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(otherParticipant.role)}`}>
                            {formatRole(otherParticipant.role)}
                        </span>
                    )}
                </div>

                {contextType && (
                    <p className="text-xs text-gray-500 truncate">
                        {contextType === 'PROPERTY' && 'Property discussion'}
                        {contextType === 'LEAD' && 'Lead discussion'}
                        {contextType === 'GENERAL' && 'General chat'}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                {/* Info button */}
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>

                {/* Close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
