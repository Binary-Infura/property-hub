'use client';

import React, { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
    length?: number;
    onComplete: (code: string) => void;
    disabled?: boolean;
}

export default function OtpInput({ length = 4, onComplete, disabled = false }: OtpInputProps) {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
    const inputRefs = useRef<HTMLInputElement[]>([]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        // Only take the last character entered
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        const combinedOtp = newOtp.join("");
        if (combinedOtp.length === length) {
            onComplete(combinedOtp);
        }

        // Focus next input
        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").slice(0, length);
        if (!/^\d+$/.test(data)) return;

        const newOtp = [...otp];
        data.split("").forEach((char, i) => {
            if (i < length) newOtp[i] = char;
        });
        setOtp(newOtp);

        if (data.length === length) {
            onComplete(data);
        }
    };

    return (
        <div className="flex gap-4 justify-center py-4">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { if (el) inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white disabled:opacity-50"
                />
            ))}
        </div>
    );
}
