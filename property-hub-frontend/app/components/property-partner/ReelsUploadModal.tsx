'use client';

import React, { useState, useEffect } from 'react';
import { reelService } from '../../services/reelService';
import { propertyService } from '../../services/propertyService';

interface ReelsUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: string;
    onSuccess: () => void;
}

export default function ReelsUploadModal({ isOpen, onClose, token, onSuccess }: ReelsUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [projects, setProjects] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Instagram Publishing Options
    const [publishToOfficialInstagram, setPublishToOfficialInstagram] = useState(false);
    const [publishToPartnerInstagram, setPublishToPartnerInstagram] = useState(false);
    const [instagramCaption, setInstagramCaption] = useState('');

    useEffect(() => {
        if (isOpen && token) {
            const fetchProjects = async () => {
                try {
                    const data = await propertyService.getAll(token, true);
                    setProjects(data);
                } catch (err) {
                    console.error('Failed to fetch projects:', err);
                }
            };
            fetchProjects();
        }
    }, [isOpen, token]);

    // Auto-generate Instagram caption when project is selected
    useEffect(() => {
        if (selectedProjectId && !instagramCaption) {
            const project = projects.find(p => p.id === selectedProjectId);
            if (project) {
                const caption = generateCaption(project);
                setInstagramCaption(caption);
            }
        }
    }, [selectedProjectId, projects]);

    const generateCaption = (project: any) => {
        const hashtags = ['#PropertyHub', '#RealEstate', '#PropertyInvesting', '#DreamHome', '#PropertyDeal'];
        const hashtag = hashtags[Math.floor(Math.random() * hashtags.length)];
        
        return `✨ Check out this amazing property! 

📍 ${project.address || project.location}
💰 ${project.price ? `₹${project.price.toLocaleString()}` : 'Price on Request'}
🏠 ${project.bedrooms || 'N/A'} BHK | 📐 ${project.area || 'N/A'} sqft

🔗 Explore more on PropertyHub!

${hashtag}`;
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        if (!selectedProjectId) {
            setError('Please select a project for this reel.');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // 1. Upload video file
            const { url } = await reelService.uploadVideo(file, token);

            // 2. Create reel record with Instagram settings
            await reelService.create({
                title,
                description,
                videoUrl: url,
                projectId: selectedProjectId,
                publishToOfficialInstagram,
                publishToPartnerInstagram,
                instagramCaption: (publishToOfficialInstagram || publishToPartnerInstagram) ? instagramCaption : undefined,
            }, token);

            onSuccess();
            onClose();
            // Reset form
            setFile(null);
            setTitle('');
            setDescription('');
            setSelectedProjectId('');
            setInstagramCaption('');
            setPublishToOfficialInstagram(false);
            setPublishToPartnerInstagram(false);
        } catch (err: any) {
            setError(err.message || 'Failed to upload reel');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Upload New Reel</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Share your property story</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <form onSubmit={handleUpload} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Video File */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest block px-1">Video File</label>
                        <div className={`relative border-2 border-dashed ${file ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'} rounded-2xl p-8 transition-all hover:bg-gray-100/50 group`}>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                required
                            />
                            <div className="text-center">
                                <div className={`w-16 h-16 ${file ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'} rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/50 shadow-sm transition-colors group-hover:scale-110 duration-300`}>
                                    {file ? (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z" />
                                        </svg>
                                    )}
                                </div>
                                <p className="text-gray-900 font-bold text-sm">{file ? file.name : 'Choose a video file'}</p>
                                <p className="text-gray-400 text-xs mt-1.5 font-medium">MP4, MOV up to 50MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest block px-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your reel a catchy title..."
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest block px-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Tell more about this property or area..."
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium resize-none text-sm"
                        />
                    </div>

                    {/* Project Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 uppercase tracking-widest block px-1">
                            Link to Project <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            required
                            className={`w-full px-5 py-4 bg-gray-50 border ${!selectedProjectId && error ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'} rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium appearance-none cursor-pointer`}
                        >
                            <option value="">Select a project...</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        {projects.length === 0 && (
                            <p className="text-xs text-amber-600 font-medium px-1">No projects found. Please create a project first.</p>
                        )}
                    </div>

                    {/* Instagram Publishing Options */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-purple-100 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg text-white">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.011 4.85.07 1.366.062 2.633.355 3.608 1.33.975.975 1.268 2.242 1.33 3.608.059 1.266.07 1.646.07 4.85s-.011 3.584-.07 4.85c-.062 1.366-.355 2.633-1.33 3.608-.975.975-2.242 1.268-3.608 1.33-1.266.059-1.646.07-4.85.07s-3.584-.011-4.85-.07c-1.366-.062-2.633-.355-3.608-1.33-.975-.975-1.268-2.242-1.33-3.608C2.174 15.584 2.163 15.204 2.163 12s.011-3.584.07-4.85c.062-1.366.355-2.633 1.33-3.608.975-.975 2.242-1.268 3.608-1.33 1.266-.059 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 5.775.13 4.902.365 4.14.693c-.779.331-1.479.779-2.078 1.378-.599.599-1.047 1.299-1.378 2.078-.328.762-.563 1.635-.621 2.913C0 8.333-.014 8.741 0 12c0 3.259.014 3.667.072 4.947.058 1.278.293 2.151.621 2.913.331.779.779 1.479 1.378 2.078.599.599 1.299 1.047 2.078 1.378.762.328 1.635.563 2.913.621C8.333 23.986 8.741 24 12 24c3.259 0 3.667-.014 4.947-.072 1.278-.058 2.151-.293 2.913-.621.779-.331 1.479-.779 2.078-1.378.599-.599 1.047-1.299 1.378-2.078.328-.762.563-1.635.621-2.913.058-1.28.072-1.688.072-4.947 0-3.259-.014-3.667-.072-4.947-.058-1.278-.293-2.151-.621-2.913-.331-.779-.779-1.479-1.378-2.078-.599-.599-1.299-1.047-2.078-1.378-.762-.328-1.635-.563-2.913-.621C15.667.014 15.259 0 12 0z" />
                                    <circle cx="12" cy="12" r="3.07" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 tracking-tight">Share on Instagram</h3>
                                <p className="text-xs text-gray-600 font-medium">Expand your reach across social media</p>
                            </div>
                        </div>

                        {/* Toggle 1: PropertyHub Official Instagram */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 transition-colors">
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 text-sm">Request to publish on PropertyHub Official Instagram</p>
                                <p className="text-xs text-gray-500 font-medium mt-1">Send for admin review and approval before posting</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPublishToOfficialInstagram(!publishToOfficialInstagram)}
                                className={`relative inline-flex h-8 w-14 flex-shrink-0 rounded-full transition-colors ${
                                    publishToOfficialInstagram ? 'bg-purple-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-7 w-7 transform rounded-full bg-white shadow transition-transform ${
                                        publishToOfficialInstagram ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Toggle 2: Partner's Instagram */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 transition-colors">
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 text-sm">Publish on my Instagram account</p>
                                <p className="text-xs text-gray-500 font-medium mt-1">Auto-upload to your Instagram using OAuth connection</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPublishToPartnerInstagram(!publishToPartnerInstagram)}
                                className={`relative inline-flex h-8 w-14 flex-shrink-0 rounded-full transition-colors ${
                                    publishToPartnerInstagram ? 'bg-purple-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-7 w-7 transform rounded-full bg-white shadow transition-transform ${
                                        publishToPartnerInstagram ? 'translate-x-7' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Instagram Caption - Show if either toggle is enabled */}
                        {(publishToOfficialInstagram || publishToPartnerInstagram) && (
                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-widest block px-1">Instagram Caption</label>
                                <textarea
                                    value={instagramCaption}
                                    onChange={(e) => setInstagramCaption(e.target.value)}
                                    rows={5}
                                    placeholder="Your Instagram caption..."
                                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all font-medium resize-none text-sm"
                                />
                                <p className="text-xs text-gray-500 font-medium px-1">
                                    {instagramCaption.length} / 2,200 characters
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border border-gray-200 text-gray-600 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !file || !selectedProjectId}
                            className="flex-1 px-10 py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 flex items-center justify-center gap-3"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Publish Reel
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
