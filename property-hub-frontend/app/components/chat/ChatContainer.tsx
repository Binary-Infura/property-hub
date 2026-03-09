'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { chatService, ChatSessionResponse, MyChatSession } from '../../services/chatService';
import ChatHeader from './ChatHeader';
import ChatList from './ChatList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatContainerProps {
    token: string;
    currentUserId: string;
    // Optional: pre-select a chat or start a new one
    initialParticipantId?: string;
    initialPropertyId?: string;
    initialLeadId?: string;
    // Styling
    className?: string;
    embedded?: boolean;
}

type ViewMode = 'list' | 'chat';

export default function ChatContainer({
    token,
    currentUserId,
    initialParticipantId,
    initialPropertyId,
    initialLeadId,
    className = '',
    embedded = false,
}: ChatContainerProps) {
    const [chatSessions, setChatSessions] = useState<MyChatSession[]>([]);
    const [activeChat, setActiveChat] = useState<ChatSessionResponse | null>(null);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    // Load chat sessions
    const loadChatSessions = useCallback(async () => {
        try {
            setLoadingSessions(true);
            const sessions = await chatService.getMyChatSessions(token);
            setChatSessions(sessions);
            setError(null);
        } catch (err) {
            console.error('Failed to load chat sessions:', err);
            setError('Failed to load chats');
        } finally {
            setLoadingSessions(false);
        }
    }, [token]);

    // Load a specific chat session
    const loadChatSession = useCallback(async (chatId: string) => {
        try {
            setLoadingChat(true);
            const session = await chatService.getChatSession(chatId, token);
            setActiveChat(session);
            setViewMode('chat');
            setError(null);
        } catch (err) {
            console.error('Failed to load chat session:', err);
            setError('Failed to load chat');
        } finally {
            setLoadingChat(false);
        }
    }, [token]);

    // Start a new chat
    const startNewChat = useCallback(async (participantId: string, propertyId?: string, leadId?: string) => {
        try {
            setLoadingChat(true);
            const session = await chatService.startChat(participantId, token, { propertyId, leadId });
            setActiveChat(session);
            setViewMode('chat');
            // Refresh chat list
            loadChatSessions();
            setError(null);
        } catch (err: any) {
            console.error('Failed to start chat:', err);
            setError(err.message || 'Failed to start chat');
        } finally {
            setLoadingChat(false);
        }
    }, [token, loadChatSessions]);

    // Initial load
    useEffect(() => {
        loadChatSessions();
    }, [loadChatSessions]);

    // Handle initial participant (start new chat)
    useEffect(() => {
        if (initialParticipantId) {
            startNewChat(initialParticipantId, initialPropertyId, initialLeadId);
        }
    }, [initialParticipantId, initialPropertyId, initialLeadId, startNewChat]);

    const handleSelectChat = (chatId: string) => {
        loadChatSession(chatId);
    };

    const handleBack = () => {
        setActiveChat(null);
        setViewMode('list');
    };

    const handleClose = () => {
        setActiveChat(null);
        setViewMode('list');
    };

    // Embedded view (single chat panel)
    if (embedded) {
        if (loadingChat) {
            return (
                <div className={`flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200 ${className}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Loading chat...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className={`flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200 ${className}`}>
                    <div className="text-center">
                        <p className="text-red-500 mb-2">{error}</p>
                        <button onClick={() => window.location.reload()} className="text-blue-500 hover:underline">
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        if (!activeChat) {
            return (
                <div className={`flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200 ${className}`}>
                    <div className="text-center text-gray-500">
                        <p>No active chat</p>
                    </div>
                </div>
            );
        }

        return (
            <div className={`flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
                <ChatHeader
                    participants={activeChat.participants}
                    currentUserId={currentUserId}
                    contextType={activeChat.contextType}
                    contextId={activeChat.contextId}
                    onClose={handleClose}
                />
                <MessageList
                    currentUserId={currentUserId}
                    participants={activeChat.participants}
                />
                <MessageInput
                />
            </div>
        );
    }

    // Full-page view (list + chat)
    return (
        <div className={`flex h-full bg-gray-50 ${className}`}>
            {/* Sidebar - Chat list */}
            <div className={`w-full lg:w-80 xl:w-96 border-r border-gray-200 ${viewMode === 'chat' ? 'hidden lg:block' : ''}`}>
                <ChatList
                    chatSessions={chatSessions}
                    selectedChatId={activeChat?.id}
                    onSelectChat={handleSelectChat}
                    loading={loadingSessions}
                    currentUserId={currentUserId}
                />
            </div>

            {/* Main chat area */}
            <div className={`flex-1 flex flex-col ${viewMode === 'list' ? 'hidden lg:flex' : ''}`}>
                {loadingChat ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-600">Loading chat...</span>
                        </div>
                    </div>
                ) : activeChat ? (
                    <>
                        <ChatHeader
                            participants={activeChat.participants}
                            currentUserId={currentUserId}
                            contextType={activeChat.contextType}
                            contextId={activeChat.contextId}
                            onBack={handleBack}
                        />
                        <MessageList
                            currentUserId={currentUserId}
                            participants={activeChat.participants}
                        />
                        <MessageInput
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
                        <p className="text-gray-400 text-center max-w-sm">
                            Choose a conversation from the list to start messaging
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
