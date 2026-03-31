"use client";

import { useEffect, useState, use } from 'react';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useLocalParticipant,
    useTracks,
    VideoTrack,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { livekitService } from '@/app/services/livekitService';
import { useAuth } from '@/app/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';

/**
 * Bespoke Premium Video Experience for Consultants
 * Optimized for full-screen tab usage.
 */
function ConsultantCallLayout() {
    const tracks = useTracks([
        Track.Source.Camera,
        Track.Source.ScreenShare,
    ]);

    const {
        localParticipant,
        isMicrophoneEnabled,
        isCameraEnabled,
        isScreenShareEnabled
    } = useLocalParticipant();

    // Auto-enable media on join
    useEffect(() => {
        if (localParticipant) {
            if (!isCameraEnabled) localParticipant.setCameraEnabled(true).catch(console.error);
            if (!isMicrophoneEnabled) localParticipant.setMicrophoneEnabled(true).catch(console.error);
        }
    }, [localParticipant]);

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Main Video Stage */}
            <div className="flex-1 min-h-0 p-6 lg:p-12 flex items-center justify-center">
                <div className="w-full h-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
                    {tracks.length === 0 ? (
                        <div className="col-span-2 flex items-center justify-center bg-slate-900/40 rounded-[56px] border border-white/5 backdrop-blur-3xl shadow-2xl">
                            <div className="text-center">
                                <div className="h-28 w-28 bg-blue-600/20 text-blue-500 rounded-[40px] flex items-center justify-center mx-auto mb-8 animate-pulse shadow-[0_0_60px_rgba(59,130,246,0.3)]">
                                    <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-4xl font-black text-white tracking-widest uppercase italic opacity-80">Line Secured</h3>
                                <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs mt-4">Consultation Ready</p>
                            </div>
                        </div>
                    ) : (
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10 w-full h-full">
                            {tracks.map((trackReference) => (
                                <div
                                    key={`${trackReference.participant.identity}-${trackReference.source}`}
                                    className="relative group rounded-[48px] overflow-hidden border border-white/10 bg-slate-900 shadow-[0_48px_96px_-24px_rgba(0,0,0,1)] transition-all duration-500 hover:scale-[1.01]"
                                >
                                    <VideoTrack trackRef={trackReference} className="w-full h-full object-cover" />

                                    <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg uppercase shadow-2xl">
                                                {trackReference.participant.identity.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-white font-black text-xl tracking-tighter leading-none uppercase">
                                                    {trackReference.participant.identity}
                                                </p>
                                                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-2">Live Specialist</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Floating Controls */}
            <div className="h-44 flex items-center justify-center px-8 relative z-[100]">
                <div className="flex items-center gap-8 bg-[#14171E]/95 backdrop-blur-3xl px-14 py-8 rounded-[48px] border border-white/10 shadow-[0_64px_128px_-32px_rgba(0,0,0,1)]">
                    <button
                        onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
                        className={`group h-20 w-20 rounded-[28px] flex items-center justify-center transition-all duration-300 ${isMicrophoneEnabled
                            ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                            : 'bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.5)]'}`}
                    >
                        <svg className="h-9 w-9 transition-transform group-active:scale-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMicrophoneEnabled
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />}
                        </svg>
                    </button>

                    <button
                        onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
                        className={`group h-20 w-20 rounded-[28px] flex items-center justify-center transition-all duration-300 ${isCameraEnabled
                            ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                            : 'bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.5)]'}`}
                    >
                        <svg className="h-9 w-9 transition-transform group-active:scale-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isCameraEnabled
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />}
                        </svg>
                    </button>

                    <div className="w-[2px] h-16 bg-white/10 mx-2 rounded-full" />

                    <button
                        onClick={() => localParticipant.setScreenShareEnabled(!isScreenShareEnabled)}
                        className={`group px-10 h-20 rounded-[28px] flex items-center gap-5 transition-all duration-300 ${isScreenShareEnabled
                            ? 'bg-blue-600 text-white shadow-3xl shadow-blue-600/40'
                            : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10 hover:text-white'}`}
                    >
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 21h6l-.75-4M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-black text-base uppercase tracking-[0.2em]">{isScreenShareEnabled ? 'Stop Presenting' : 'Present Screen'}</span>
                    </button>

                    <div className="w-[2px] h-16 bg-white/10 mx-2 rounded-full" />

                    <button
                        onClick={() => window.close()}
                        className="px-12 h-20 rounded-[28px] bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-2 border-red-500/20 hover:border-red-500 transition-all font-black text-sm uppercase tracking-[0.3em] active:scale-95 shadow-2xl"
                    >
                        Terminate Session
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ConsultantCallPage({ params }: { params: Promise<{ roomName: string }> }) {
    const { roomName } = use(params);
    const { token: authToken } = useAuth();
    const searchParams = useSearchParams();
    const leadName = searchParams.get('leadName') || 'Property Consultation';

    const [lkToken, setLkToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        const joinUrl = `${window.location.origin}/join-call/${roomName}`;
        navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (!authToken) return;
        async function fetchToken() {
            try {
                const t = await livekitService.getToken(authToken!, roomName);
                if (t) setLkToken(t);
                else setError('Identity verification failed');
            } catch (err: any) {
                console.error('Error fetching LiveKit token:', err);
                setError('Could not establish encrypted video connection.');
            } finally {
                setLoading(false);
            }
        }
        fetchToken();
    }, [authToken, roomName]);

    if (!authToken) {
        return (
            <div className="h-screen w-screen bg-[#0A0C10] flex items-center justify-center p-10 font-sans">
                <div className="text-center">
                    <h3 className="text-3xl font-black text-red-500 tracking-widest uppercase italic mb-4">Unauthorized Access</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs font-sans">Please sign in to access boutique consultations</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-screen w-screen bg-[#0A0C10] flex flex-col items-center justify-center p-10 font-sans">
                <div className="h-32 w-32 border-[8px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                <h3 className="mt-16 text-4xl font-black text-white tracking-widest uppercase italic opacity-80">Securing Feed</h3>
                <p className="mt-4 text-slate-500 font-bold uppercase tracking-[0.4em] text-xs">End-to-End Encrypted Tunnel</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-screen bg-[#0A0C10] flex items-center justify-center p-6 font-sans">
                <div className="bg-slate-900/60 backdrop-blur-3xl p-16 rounded-[64px] border border-white/10 text-center max-w-xl w-full shadow-[0_80px_160px_-40px_rgba(0,0,0,1)]">
                    <div className="h-32 w-32 bg-red-500/10 text-red-500 rounded-[48px] flex items-center justify-center mx-auto mb-10 border border-red-500/20">
                        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-5xl font-black text-white mb-6 tracking-tight">Sync Failed</h3>
                    <p className="text-slate-400 mb-12 font-bold text-xl leading-relaxed px-6">{error}</p>
                    <button
                        onClick={() => window.close()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-[28px] transition-all shadow-3xl shadow-blue-600/40 uppercase tracking-[0.3em] text-sm active:scale-95"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={lkToken!}
            connect={true}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://video-call-app-xbhm65uv.livekit.cloud'}
            onDisconnected={() => {
                window.close();
            }}
            onError={(err) => setError(`Session Interrupted: ${err.message}`)}
            className="h-screen w-screen bg-[#0A0C10] flex flex-col overflow-hidden font-sans relative z-50"
        >
            <ConsultantCallLayout />
            <RoomAudioRenderer />
        </LiveKitRoom>
    );
}
