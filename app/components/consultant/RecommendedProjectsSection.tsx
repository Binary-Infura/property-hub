"use client";

import { useState } from 'react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  platform: string;
  leads: Lead[];
}

interface Unit {
  id: string;
  unitNumber: string;
  floor?: number;
  type?: string;
  area?: string | number;
  price: string | number;
  status: string;
}

interface Project {
  id: string;
  name: string;
  location: string;
  price: string | number;
  area?: string | number;
  projectType: string;
  status: string;
  city?: { name: string };
  campaigns?: Campaign[];
  units?: Unit[];
}

interface RecommendedPropertiesSectionProps {
  projects: Project[];
}

export default function RecommendedProjectsSection({
  projects,
}: RecommendedPropertiesSectionProps) {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'units' | 'campaigns'>('units');

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE': return 'text-green-600 bg-green-50';
      case 'SOLD': return 'text-red-600 bg-red-50';
      case 'RESERVED': return 'text-yellow-600 bg-yellow-50';
      case 'BOOKED': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Assigned Projects</h3>
        <p className="text-gray-700">
          You are assigned to {projects.length} projects. Expand a project to see its units, related marketing campaigns, and leads.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 font-medium">No projects assigned yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                    <p className="text-gray-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {project.location}{project.city ? `, ${project.city.name}` : ''}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Price</p>
                    <p className="text-lg font-bold text-gray-900">₹{Number(project.price).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Area</p>
                    <p className="text-lg font-bold text-gray-900">{project.area || 'N/A'} sqft</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                    <p className="text-lg font-bold text-gray-900">{project.projectType}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (expandedProject === project.id) {
                      setExpandedProject(null);
                    } else {
                      setExpandedProject(project.id);
                      setActiveTab('units');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg border border-gray-200 transition"
                >
                  {expandedProject === project.id ? 'Hide Details' : `View Details (Units & Campaigns)`}
                  <svg className={`w-4 h-4 transition-transform ${expandedProject === project.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedProject === project.id && (
                  <div className="mt-6 border-t pt-6">
                    {/* Internal Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                      <button
                        onClick={() => setActiveTab('units')}
                        className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${activeTab === 'units'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        Units ({project.units?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${activeTab === 'campaigns'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        Campaigns & Leads ({project.campaigns?.length || 0})
                      </button>
                    </div>

                    {/* Units Tab Content */}
                    {activeTab === 'units' && (
                      <div className="space-y-4">
                        {project.units && project.units.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.units.map(unit => (
                              <div key={unit.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between hover:border-blue-200 transition">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-gray-900 text-lg">Unit {unit.unitNumber}</h4>
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(unit.status)}`}>
                                    {unit.status}
                                  </span>
                                </div>
                                <div className="space-y-1 mb-3">
                                  <p className="text-sm text-gray-600 flex justify-between">
                                    <span className="text-gray-400">Type:</span> <span className="font-medium">{unit.type || 'N/A'}</span>
                                  </p>
                                  <p className="text-sm text-gray-600 flex justify-between">
                                    <span className="text-gray-400">Floor:</span> <span className="font-medium">{unit.floor !== null ? unit.floor : 'N/A'}</span>
                                  </p>
                                  <p className="text-sm text-gray-600 flex justify-between">
                                    <span className="text-gray-400">Area:</span> <span className="font-medium">{unit.area ? `${unit.area} sqft` : 'N/A'}</span>
                                  </p>
                                </div>
                                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                  <span className="text-xs text-gray-500 font-semibold uppercase">Price</span>
                                  <span className="text-blue-600 font-bold">₹{Number(unit.price).toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 text-sm italic py-8 bg-gray-50 rounded border border-gray-100">No units found for this project.</p>
                        )}
                      </div>
                    )}

                    {/* Campaigns Tab Content */}
                    {activeTab === 'campaigns' && (
                      <div className="space-y-6">
                        {project.campaigns && project.campaigns.length > 0 ? (
                          project.campaigns.map(campaign => (
                            <div key={campaign.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex justify-between items-center mb-4">
                                <div>
                                  <h4 className="font-bold text-gray-900">{campaign.name}</h4>
                                  <p className="text-xs text-gray-500">Platform: {campaign.platform}</p>
                                </div>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                  {campaign.leads.length} Leads
                                </span>
                              </div>

                              <div className="space-y-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Leads generated</p>
                                <div className="grid gap-3">
                                  {campaign.leads.map(lead => (
                                    <div key={lead.id} className="bg-white p-3 rounded border border-gray-100 flex justify-between items-center shadow-sm">
                                      <div>
                                        <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                                        <p className="text-xs text-gray-500">{lead.email} | {lead.phone}</p>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">
                                          {lead.status}
                                        </span>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                          {new Date(lead.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 text-sm italic py-8 bg-gray-50 rounded border border-gray-100">No campaigns or leads found for this project.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
