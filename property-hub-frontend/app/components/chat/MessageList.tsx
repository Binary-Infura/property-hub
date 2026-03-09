'use client';

import React, { useState } from 'react';

interface MessageListProps {
    currentUserId: string;
    participants: { id: string; name: string; role: string }[];
}

export default function MessageList({
    currentUserId,
    participants,
}: MessageListProps) {
    return (
        <div className="flex-1 overflow-y-auto p-4 bg-white">
            <div className="text-center text-gray-500">
                <p className="mb-2">Chat messaging feature is currently unavailable.</p>
                <p className="text-sm">Participants in this chat:</p>
                <ul className="mt-3 space-y-1">
                    {participants.map((p) => (
                        <li key={p.id} className="text-sm">
                            {p.name} ({p.role})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading messages...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-500 mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-blue-500 hover:underline"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Group messages by date
    const groupedMessages: { date: string; messages: DisplayMessage[] }[] = [];
    let currentDate = '';

    messages.forEach((msg) => {
        const msgDate = formatDate(msg.createAt);
        if (msgDate !== currentDate) {
            currentDate = msgDate;
            groupedMessages.push({ date: msgDate, messages: [msg] });
        } else {
            groupedMessages[groupedMessages.length - 1].messages.push(msg);
        }
    });

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                </div>
            ) : (
                groupedMessages.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        {/* Date separator */}
                        <div className="flex items-center justify-center my-4">
                            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                {group.date}
                            </div>
                        </div>

                        {/* Messages for this date */}
                        {group.messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.isOwn
                                            ? 'bg-blue-500 text-white rounded-br-md'
                                            : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                                        }`}
                                >
                                    {!msg.isOwn && (
                                        <p className="text-xs font-medium text-blue-600 mb-1">
                                            {msg.userName}
                                        </p>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                    <p
                                        className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-400'
                                            }`}
                                    >
                                        {formatTime(msg.createAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
