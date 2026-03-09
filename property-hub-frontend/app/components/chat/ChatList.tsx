'use client';

import React from 'react';
import { MyChatSession, ChatParticipant } from '../../services/chatService';

interface ChatListProps {
    chatSessions: MyChatSession[];
    selectedChatId?: string;
    onSelectChat: (chatId: string) => void;
    loading?: boolean;
    currentUserId: string;
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

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

export default function ChatList({
    chatSessions,
    selectedChatId,
    onSelectChat,
    loading = false,
    currentUserId,
}: ChatListProps) {
    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading chats...</span>
                </div>
            </div>
        );
    }

    if (chatSessions.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-white px-4">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-600 font-medium">No conversations yet</p>
                <p className="text-gray-400 text-sm text-center mt-1">
                    Start a chat from a property or lead page
                </p>
            </div>
        );
    }

    return (
        <div className="h-full bg-white overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <p className="text-xs text-gray-500">{chatSessions.length} conversation{chatSessions.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Chat list */}
            <div className="divide-y divide-gray-100">
                {chatSessions.map((chat) => {
                    const otherParticipant = chat.participants.find(p => p.id !== currentUserId) || chat.participants[0];
                    const isSelected = chat.id === selectedChatId;

                    return (
                        <button
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                }`}
                        >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    {otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                {chat.unreadCount && chat.unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">
                                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium text-gray-900 truncate">
                                        {otherParticipant?.name || 'Unknown'}
                                    </span>
                                    {chat.lastMessageAt && (
                                        <span className="text-xs text-gray-400 flex-shrink-0">
                                            {formatTimeAgo(chat.lastMessageAt)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${getRoleBadgeColor(otherParticipant?.role || '')}`}>
                                        {formatRole(otherParticipant?.role || '')}
                                    </span>

                                    {chat.contextType && (
                                        <span className="text-xs text-gray-400">
                                            • {chat.contextType === 'PROPERTY' ? 'Property' : chat.contextType === 'LEAD' ? 'Lead' : 'General'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Chevron */}
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
