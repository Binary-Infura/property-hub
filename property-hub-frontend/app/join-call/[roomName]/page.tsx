"use client";

import { useEffect, useState, use } from 'react';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    useLocalParticipant,
    useTracks,
    VideoTrack,
} from '@/node_modules/@livekit/components-react/dist';
import { Track } from '@/node_modules/livekit-client/dist/src';
import '@livekit/components-styles';
import { livekitService } from '@/app/services/livekitService';

/**
 * Custom Video Layout for the Lead (matching consultant's premium UI)
 */
function CustomVideoLayout() {
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

    // Ensure camera and mic are enabled on start for lead
    useEffect(() => {
        if (localParticipant) {
            if (!isCameraEnabled) {
                localParticipant.setCameraEnabled(true).catch(console.error);
            }
            if (!isMicrophoneEnabled) {
                localParticipant.setMicrophoneEnabled(true).catch(console.error);
            }
        }
    }, [localParticipant, isCameraEnabled, isMicrophoneEnabled]);

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Main Video Stage */}
            <div className="flex-1 min-h-0 p-4 lg:p-10 flex items-center justify-center">
                <div className="w-full h-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {tracks.length === 0 ? (
                        <div className="col-span-2 flex items-center justify-center bg-slate-900/40 rounded-[48px] border border-white/5 backdrop-blur-3xl shadow-2xl">
                            <div className="text-center">
                                <div className="h-24 w-24 bg-blue-600/20 text-blue-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tight mb-3 uppercase italic opacity-80">Connecting Stage...</h3>
                                <p className="text-slate-400 font-bold italic text-lg uppercase tracking-widest opacity-60">Ready for Consultation</p>
                            </div>
                        </div>
                    ) : (
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 w-full h-full">
                            {tracks.map((trackReference) => (
                                <div
                                    key={`${trackReference.participant.identity}-${trackReference.source}`}
                                    className="relative group rounded-[40px] overflow-hidden border border-white/10 bg-slate-900 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] transition-transform hover:scale-[1.01] duration-500"
                                >
                                    <VideoTrack trackRef={trackReference} className="w-full h-full object-cover" />

                                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm uppercase shadow-lg">
                                                {trackReference.participant.identity.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-white font-black text-base tracking-tight leading-none uppercase">
                                                    {trackReference.participant.identity}
                                                </p>
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Live Participant</p>
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
            <div className="h-40 flex items-center justify-center px-8 relative z-[100]">
                <div className="flex items-center gap-6 bg-[#14171E]/95 backdrop-blur-3xl px-12 py-6 rounded-[40px] border border-white/10 shadow-[0_48px_96px_-24px_rgba(0,0,0,1)]">
                    <button
                        onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
                        className={`group h-16 w-16 rounded-[22px] flex items-center justify-center transition-all duration-300 ${isMicrophoneEnabled
                            ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                            : 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]'}`}
                    >
                        <svg className="h-7 w-7 transition-transform group-active:scale-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMicrophoneEnabled
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />}
                        </svg>
                    </button>

                    <button
                        onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
                        className={`group h-16 w-16 rounded-[22px] flex items-center justify-center transition-all duration-300 ${isCameraEnabled
                            ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                            : 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]'}`}
                    >
                        <svg className="h-7 w-7 transition-transform group-active:scale-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isCameraEnabled
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />}
                        </svg>
                    </button>

                    <div className="w-[2px] h-12 bg-white/10 mx-2 rounded-full" />

                    <button
                        onClick={() => {
                            window.location.href = '/';
                        }}
                        className="px-10 h-16 rounded-[22px] bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-2 border-red-500/20 hover:border-red-500 transition-all font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 group"
                    >
                        Disconnect
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function JoinCallPage({ params }: { params: Promise<{ roomName: string }> }) {
    const { roomName } = use(params);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchToken() {
            try {
                const t = await livekitService.getPublicToken(roomName);
                if (t) setToken(t);
                else setError('Invalid or expired meeting token');
            } catch (err: any) {
                console.error('Error fetching public token:', err);
                setError('Could not connect to property advisor. Please refresh.');
            } finally {
                setLoading(false);
            }
        }
        fetchToken();
    }, [roomName]);

    if (loading) {
        return (
            <div className="h-screen w-screen bg-[#0A0C10] flex flex-col items-center justify-center p-10 font-sans">
                <div className="h-28 w-28 border-[6px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                <h3 className="mt-12 text-3xl font-black text-white tracking-tighter uppercase italic opacity-80">Syncing Identity</h3>
                <p className="mt-3 text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Boutique Interface</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen w-screen bg-[#0A0C10] flex items-center justify-center p-6 font-sans">
                <div className="bg-slate-900/60 backdrop-blur-3xl p-14 rounded-[56px] border border-white/10 text-center max-w-lg w-full shadow-[0_80px_160px_-40px_rgba(0,0,0,0.9)]">
                    <div className="h-28 w-28 bg-red-500/10 text-red-500 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-red-500/20">
                        <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-4xl font-black text-white mb-4 tracking-tight">Session Failed</h3>
                    <p className="text-slate-400 mb-12 font-bold text-lg leading-relaxed px-4">{error}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-3xl transition-all shadow-2xl shadow-blue-600/40 uppercase tracking-[0.2em] text-xs active:scale-95"
                    >
                        Exit to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[#0A0C10] flex flex-col overflow-hidden font-sans relative">
            {/* Ambient Atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-30%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[250px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[250px] rounded-full" />
            </div>

            {/* Premium Branding Header */}
            <header className="relative z-[110] px-12 py-10 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="relative group">
                        <div className="h-20 w-20 rounded-[30px] bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-600/40 transform transition-transform group-hover:rotate-12">
                            PH
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-7 w-7 bg-green-500 border-[6px] border-[#0A0C10] rounded-full shadow-xl" />
                    </div>
                    <div>
                        <h2 className="text-white font-black text-3xl tracking-tighter leading-none mb-3">Live Consultation</h2>
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                                <p className="text-blue-400 text-[11px] uppercase font-black tracking-[3px] italic">Boutique Expert</p>
                            </div>
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Session in Progress</p>
                        </div>
                    </div>
                </div>
            </header>

            <LiveKitRoom
                video={true}
                audio={true}
                token={token!}
                connect={true}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://video-call-app-xbhm65uv.livekit.cloud'}
                onDisconnected={() => {
                    window.location.href = '/';
                }}
                className="flex-1 flex flex-col min-h-0 relative z-50"
            >
                <CustomVideoLayout />
                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
}
