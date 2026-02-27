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

interface Property {
  id: string;
  name: string;
  location: string;
  price: string | number;
  area?: string | number;
  propertyType: string;
  status: string;
  city?: { name: string };
  campaigns?: Campaign[];
}

interface RecommendedPropertiesSectionProps {
  properties: Property[];
}

export default function RecommendedPropertiesSection({
  properties,
}: RecommendedPropertiesSectionProps) {
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE': return 'text-green-600 bg-green-50';
      case 'SOLD': return 'text-red-600 bg-red-50';
      case 'RESERVED': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Assigned Properties</h3>
        <p className="text-gray-700">
          You are assigned to {properties.length} properties. Expand a property to see related marketing campaigns and leads.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 font-medium">No properties assigned yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {properties.map(property => (
            <div
              key={property.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{property.name}</h3>
                    <p className="text-gray-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {property.location}{property.city ? `, ${property.city.name}` : ''}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(property.status)}`}>
                    {property.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Price</p>
                    <p className="text-lg font-bold text-gray-900">₹{Number(property.price).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Area</p>
                    <p className="text-lg font-bold text-gray-900">{property.area || 'N/A'} sqft</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                    <p className="text-lg font-bold text-gray-900">{property.propertyType}</p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedProperty(expandedProperty === property.id ? null : property.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg border border-gray-200 transition"
                >
                  {expandedProperty === property.id ? 'Hide Campaigns & Leads' : `View Campaigns & Leads (${property.campaigns?.length || 0})`}
                  <svg className={`w-4 h-4 transition-transform ${expandedProperty === property.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedProperty === property.id && (
                  <div className="mt-6 border-t pt-6 space-y-6">
                    {property.campaigns && property.campaigns.length > 0 ? (
                      property.campaigns.map(campaign => (
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
                      <p className="text-center text-gray-500 text-sm italic">No campaigns or leads found for this property.</p>
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


