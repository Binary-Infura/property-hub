'use client';

import React from 'react';

export default function ConsultantCallLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-screen overflow-hidden bg-[#0A0C10] font-sans">
            {children}
        </div>
    );
}
