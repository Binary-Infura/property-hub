"use client";

import { useEffect, useState } from 'react';
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

interface VideoCallModalProps {
    token: string;
    roomName: string;
    onClose: () => void;
    leadName: string;
}

/**
 * Custom Video Layout for the Consultant
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

    // Ensure camera and mic are enabled on start
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
            <div className="flex-1 min-h-0 p-4 lg:p-6 flex items-center justify-center">
                <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {tracks.length === 0 ? (
                        <div className="col-span-2 flex items-center justify-center bg-slate-900/40 rounded-[32px] border border-white/5 backdrop-blur-3xl shadow-2xl">
                            <div className="text-center">
                                <div className="h-20 w-20 bg-blue-600/20 text-blue-500 rounded-[24px] flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase opacity-80 italic">Line Secured...</h3>
                                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Ready for Connection</p>
                            </div>
                        </div>
                    ) : (
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full">
                            {tracks.map((trackReference) => (
                                <div
                                    key={`${trackReference.participant.identity}-${trackReference.source}`}
                                    className="relative group rounded-[32px] overflow-hidden border border-white/10 bg-slate-900 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)] transition-transform hover:scale-[1.01] duration-500"
                                >
                                    {/* CRITICAL: Passing trackRef property explicitly to fix "No TrackRef" error */}
                                    <VideoTrack trackRef={trackReference} className="w-full h-full object-cover" />

                                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs uppercase shadow-lg">
                                                {trackReference.participant.identity.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-white font-black text-sm tracking-tight leading-none uppercase">
                                                    {trackReference.participant.identity}
                                                </p>
                                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Live Feed</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Floating Controls - Optimized height */}
            <div className="h-28 flex items-center justify-center px-4 relative z-[100]">
                <div className="flex items-center gap-4 bg-[#14171E]/95 backdrop-blur-3xl px-8 py-4 rounded-[24px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,1)] scale-90 md:scale-100">
                    <button
                        onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
                        className={`group h-12 w-12 rounded-[16px] flex items-center justify-center transition-all duration-300 ${isMicrophoneEnabled
                            ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                            : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}
                    >
                        <svg className="h-5 w-5 transition-transform group-active:scale-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMicrophoneEnabled
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />}
                        </svg>
                    </button>

                    <button
                        onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
                        className={`group h-12 w-12 rounded-[16px] flex items-center justify-center transition-all duration-300 ${isCameraEnabled
                            ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                            : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'}`}
                    >
                        <svg className="h-5 w-5 transition-transform group-active:scale-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isCameraEnabled
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />}
                        </svg>
                    </button>

                    <div className="w-[1px] h-8 bg-white/10 mx-1 rounded-full" />

                    <button
                        onClick={() => localParticipant.setScreenShareEnabled(!isScreenShareEnabled)}
                        className={`group px-6 h-12 rounded-[16px] flex items-center gap-3 transition-all duration-300 ${isScreenShareEnabled
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 shadow-blue-500/10'
                            : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10 hover:text-white'}`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 21h6l-.75-4M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-black text-[10px] uppercase tracking-widest">{isScreenShareEnabled ? 'Stop Share' : 'Share Screen'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function VideoCallModal({ token: authToken, roomName, onClose, leadName }: VideoCallModalProps) {
    const [lkToken, setLkToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function fetchToken() {
            try {
                const t = await livekitService.getToken(authToken, roomName);
                if (t) setLkToken(t);
                else setError('Authorization failed');
            } catch (err: any) {
                console.error('Error fetching LiveKit token:', err);
                setError('Secured video line could not be established.');
            } finally {
                setLoading(false);
            }
        }
        fetchToken();
    }, [authToken, roomName]);

    const handleCopyLink = () => {
        const joinUrl = `${window.location.origin}/join-call/${roomName}`;
        navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-10 font-sans">
                <div className="bg-[#0A0C10] p-12 rounded-[40px] border border-white/10 shadow-3xl text-center">
                    <div className="h-20 w-20 border-[6px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin mx-auto mb-8" />
                    <h3 className="text-2xl font-black text-white tracking-widest uppercase italic opacity-80">Securing Feed</h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 font-sans">
                <div className="bg-[#0A0C10] p-12 rounded-[40px] border border-white/10 text-center max-w-md w-full shadow-2xl">
                    <div className="h-20 w-20 bg-red-500/10 text-red-500 rounded-[24px] flex items-center justify-center mx-auto mb-10 border border-red-500/20">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Sync Failed</h3>
                    <p className="text-slate-400 mb-10 font-bold leading-relaxed px-4">{error}</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-blue-600/40 uppercase tracking-[0.2em] text-xs active:scale-95"
                    >
                        Close Portal
                    </button>
                </div>
            </div>
        );
    }

    return (
        /* Reduced from inset-0 to a centered modal to fix "Why is it full screen?" */
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-10 lg:p-16">
            <div className="relative w-full h-full max-w-7xl max-h-[850px] bg-[#0A0C10] rounded-[48px] border border-white/10 shadow-[0_64px_128px_-32px_rgba(0,0,0,1)] flex flex-col overflow-hidden font-sans">

                {/* Ambient Atmosphere - Inside Modal */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-30%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[250px] rounded-full" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[250px] rounded-full" />
                </div>

                {/* Header - Scaled for Modal */}
                <header className="relative z-[220] px-8 py-6 flex items-center justify-between border-b border-white/5 bg-[#0A0C10]/40 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="h-14 w-14 rounded-[18px] bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-xl transform transition-transform group-hover:rotate-12">
                                {leadName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-[3px] border-[#0A0C10] rounded-full shadow-lg shadow-green-500/20" />
                        </div>
                        <div>
                            <h1 className="text-white font-black text-xl tracking-tighter leading-none mb-1.5 uppercase">{leadName}</h1>
                            <div className="flex items-center gap-3">
                                <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded">
                                    <p className="text-blue-400 text-[9px] uppercase font-black tracking-widest italic">Expert Class</p>
                                </div>
                                <span className="h-1 w-1 rounded-full bg-slate-800" />
                                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Encrypted</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCopyLink}
                            className={`flex items-center gap-2 px-6 py-3 rounded-[16px] transition-all border-2 font-black text-[10px] uppercase tracking-[0.15em] ${copied
                                ? 'bg-green-500 border-green-500 text-white shadow-xl shadow-green-500/40'
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {copied
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />}
                            </svg>
                            {copied ? 'Copied' : 'Invite'}
                        </button>
                        <button
                            onClick={onClose}
                            className="h-14 w-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[18px] flex items-center justify-center transition-all hover:bg-red-500 hover:text-white shadow-xl active:scale-95 group"
                        >
                            <svg className="h-7 w-7 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="flex-1 min-h-0 relative z-50 flex flex-col">
                    <LiveKitRoom
                        video={true}
                        audio={true}
                        token={lkToken!}
                        connect={true}
                        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://video-call-app-xbhm65uv.livekit.cloud'}
                        onDisconnected={() => {
                            if (!error) onClose();
                        }}
                        onError={(err) => setError(`Connection Lost: ${err.message}`)}
                        className="flex-1 flex flex-col min-h-0"
                    >
                        <CustomVideoLayout />
                        <RoomAudioRenderer />
                    </LiveKitRoom>
                </div>
            </div>
        </div>
    );
}
