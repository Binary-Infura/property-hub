
'use client';
import { useState, useEffect } from 'react';
import { Property, PropertyStatus } from '@/app/types/property';
import { useAuth } from '@/app/contexts/AuthContext';
import { useUnifiedApp } from '@/app/contexts/UnifiedAppContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SelectProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SelectProjectModal({ isOpen, onClose, onSuccess }: SelectProjectModalProps) {
    const { token } = useAuth();
    const { activeContext } = useUnifiedApp();

    const [step, setStep] = useState(1);
    const [selectedProject, setSelectedProject] = useState<Property | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);

    // The tick to confirm
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedProject(null);
            setConfirmed(false);
            fetchAvailableProjects();
        }
    }, [isOpen]);

    const fetchAvailableProjects = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/projects/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const allProjects = data.map((p: any) => ({
                    id: p.id,
                    title: p.name,
                    location: p.location,
                    startingPrice: parseFloat(p.price) || 0,
                    status: p.status?.toLowerCase() as PropertyStatus,
                    description: p.description,
                    totalArea: parseFloat(p.area) || 0,
                    propertyType: p.propertyType,
                }));
                setProjects(allProjects);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (project: any) => {
        setSelectedProject(project);
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!token || !selectedProject) return;
        setSubmitting(true);

        try {
            const payload = {
                status: 'SUBMITTED',
            };

            const res = await fetch(`${API_URL}/api/projects/${selectedProject.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                onSuccess();
                onClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose} />
                <div className="relative overflow-hidden rounded-2xl bg-white text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-3xl">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-xl font-bold text-gray-900">{step === 1 ? 'Select Project to List' : 'Confirm Public Data'}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {step === 1 ? (
                            loading ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    Loading available projects...
                                </div>
                            ) : projects.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 font-medium">No available projects found.</p>
                                    <p className="text-sm text-gray-400 mt-1">Add projects in "My Projects" first.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {projects.map(project => {
                                        const isAlreadySubmitted = ['submitted', 'approved', 'published'].includes(project.status);
                                        return (
                                            <div
                                                key={project.id}
                                                onClick={() => !isAlreadySubmitted && handleSelect(project)}
                                                className={`flex items-center justify-between p-4 border rounded-xl transition-all ${isAlreadySubmitted ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-75' : 'border-gray-200 hover:bg-gray-50 cursor-pointer pointer'}`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className={`font-bold ${isAlreadySubmitted ? 'text-gray-400' : 'text-gray-900'}`}>{project.title}</h4>
                                                        {isAlreadySubmitted && (
                                                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-500">
                                                                Already {project.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate max-w-[400px]">{project.location}</p>
                                                    {!isAlreadySubmitted && <p className="text-xs text-blue-600 font-semibold mt-1">Click to select</p>}
                                                </div>
                                                <div className="ml-4">
                                                    {isAlreadySubmitted ? (
                                                        <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-4">The following data will be shown publicly:</h4>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-500">Title:</span> <p className="font-semibold">{selectedProject?.title}</p></div>
                                        <div><span className="text-gray-500">Location:</span> <p className="font-semibold">{selectedProject?.location}</p></div>
                                        <div><span className="text-gray-500">Area:</span> <p className="font-semibold">{selectedProject?.totalArea} Sq Ft</p></div>
                                        <div><span className="text-gray-500">Starting Price:</span> <p className="font-semibold">₹{(selectedProject?.startingPrice ?? 0) / 100000} Lakhs</p></div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500">Description & Amenities:</span>
                                            <p className="font-semibold mt-1 whitespace-pre-wrap">{selectedProject?.description}</p>
                                        </div>
                                    </div>
                                </div>

                                <label className="flex items-start p-4 rounded-xl border border-blue-100 bg-blue-50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={confirmed}
                                        onChange={(e) => setConfirmed(e.target.checked)}
                                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                    />
                                    <div>
                                        <p className="font-bold text-blue-900 text-sm">Yes, I confirm this data to be shown publicly</p>
                                        <p className="text-xs text-blue-700 mt-1">Once submitted, it will be reviewed by admin before becoming live.</p>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between">
                        {step === 2 ? (
                            <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">Back</button>
                        ) : (
                            <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition">Cancel</button>
                        )}

                        {step === 2 && (
                            <button
                                onClick={handleSubmit}
                                disabled={!confirmed || submitting}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition shadow-lg shadow-green-200 flex items-center gap-2"
                            >
                                {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                Submit for Review
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
