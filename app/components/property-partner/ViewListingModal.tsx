'use client';

import { Property } from '@/app/types/property';
import { PROPERTY_STATUS_CONFIG } from '@/app/constants/property';

interface ViewListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
}

export default function ViewListingModal({ isOpen, onClose, property }: ViewListingModalProps) {
    if (!isOpen || !property) return null;

    const statusConfig = PROPERTY_STATUS_CONFIG[property.status];

    return (
        <div className="fixed inset-0 z-[110] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                />

                <div className="relative overflow-hidden rounded-2xl bg-white text-left shadow-2xl sm:my-8 sm:w-full sm:max-w-3xl transform transition-all animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Submitted Listing Data</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Review the details submitted for public listing</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors group">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[75vh] overflow-y-auto">
                        <div className="space-y-8">
                            {/* Property Basic Info */}
                            <div className="flex justify-between items-start bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{property.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusConfig.bgColor} ${statusConfig.color}`}>
                                            {statusConfig.label}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-xs text-gray-500 capitalize">{property.propertyType}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-blue-600">₹{(property.startingPrice / 100000).toFixed(1)}L+</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Submitted Price</p>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div>
                                <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    Location Details
                                </h5>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Continent</p>
                                        <p className="text-sm text-gray-900 font-medium">{property.continent || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Country</p>
                                        <p className="text-sm text-gray-900 font-medium">{property.country || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">State</p>
                                        <p className="text-sm text-gray-900 font-medium">{property.state || '-'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">City</p>
                                        <p className="text-sm text-gray-900 font-medium">{property.city || '-'}</p>
                                    </div>
                                    <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Region / Locality</p>
                                        <p className="text-sm text-gray-900 font-medium">{property.location}</p>
                                    </div>
                                    <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Street Address</p>
                                        <p className="text-sm text-gray-900 font-medium">{property.address || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description & Marketing */}
                            <div>
                                <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    Marketing Information
                                </h5>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Public Description</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {property.description}
                                        </p>
                                    </div>

                                    {property.amenities && property.amenities.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {property.amenities.map(amenity => (
                                                <span key={amenity} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 font-medium">
                                                    ✨ {amenity}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Video Preview */}
                            {property.videoUrl && (
                                <div>
                                    <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                        Video Presentation
                                    </h5>
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                                        <video
                                            className="w-full h-full object-cover"
                                            controls
                                            preload="metadata"
                                        >
                                            <source src={property.videoUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                </div>
                            )}

                            {/* Property Stats (Area etc) */}
                            <div>
                                <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    Technical Details
                                </h5>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 border border-gray-100 rounded-lg">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Area</p>
                                        <p className="text-base font-bold text-gray-900">{property.totalArea} <small className="text-[10px] font-medium text-gray-400">SQ FT</small></p>
                                    </div>
                                    <div className="text-center p-3 border border-gray-100 rounded-lg">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Buildings</p>
                                        <p className="text-base font-bold text-gray-900">{property.totalBuildings}</p>
                                    </div>
                                    <div className="text-center p-3 border border-gray-100 rounded-lg">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Units</p>
                                        <p className="text-base font-bold text-gray-900">{property.totalUnits}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition shadow-md shadow-gray-200"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
