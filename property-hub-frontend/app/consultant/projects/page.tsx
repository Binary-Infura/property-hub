"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { consultantService } from '@/app/services/consultantService';
import RecommendedProjectsSection from '@/app/components/consultant/RecommendedProjectsSection';

export default function ProjectsPage() {
    const { token } = useAuth();
    const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!token) return;
            try {
                const props = await consultantService.getAssignedProjects(token);
                setAssignedProjects(props);
            } catch (error) {
                console.error('Error fetching consultant projects:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Assigned Projects</h1>
                    <p className="text-gray-600 mt-1">View and manage the projects currently assigned to you</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <RecommendedProjectsSection projects={assignedProjects} />
                </div>
            </div>
        </div>
    );
}
