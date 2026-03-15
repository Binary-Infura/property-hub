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


