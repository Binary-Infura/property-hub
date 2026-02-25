'use client';

import { useState } from 'react';

interface InternalNote {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

interface PropertySubmission {
  id: string;
  title: string;
  config: string;
  location: string;
  price: string;
  area: string;
  age: string;
  description: string;
  amenities: string[];
  images: string[];
  brochure?: string;
  builderName: string;
  builderEmail: string;
  submittedAt: Date;
  status: 'submitted' | 'approved' | 'rejected' | 'live';
  internalNotes: InternalNote[];
  rejectionReason?: string;
  approvalDate?: Date;
  liveDate?: Date;
}

interface PropertyDetailModalProps {
  property: PropertySubmission;
  onClose: () => void;
  onApprove: (goLive: boolean) => void;
  onReject: (id: string, reason: string) => void;
  onAddNote: (note: string) => void;
  onPublish: () => void;
}

export default function PropertyDetailModal({
  property,
  onClose,
  onApprove,
  onReject,
  onAddNote,
  onPublish,
}: PropertyDetailModalProps) {
  const [noteText, setNoteText] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showApproveOptions, setShowApproveOptions] = useState(false);

  const handleAddNote = () => {
    if (noteText.trim()) {
      onAddNote(noteText);
      setNoteText('');
    }
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(property.id, rejectionReason);
      setRejectionReason('');
      setShowRejectForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      live: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
            <p className="text-gray-600 text-sm mt-1">
              Submitted by {property.builderName} ({property.builderEmail})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Status Badge */}
          <div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(property.status)}`}>
              {property.status === 'submitted' && 'Pending Review'}
              {property.status === 'approved' && 'Approved'}
              {property.status === 'rejected' && 'Rejected'}
              {property.status === 'live' && 'Live on Platform'}
            </span>
          </div>

          {/* Property Details Grid */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
            <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 font-medium">Configuration</p>
                <p className="text-gray-900 font-semibold mt-1">{property.config}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Location</p>
                <p className="text-gray-900 font-semibold mt-1">{property.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Price</p>
                <p className="text-gray-900 font-semibold mt-1">{property.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Area</p>
                <p className="text-gray-900 font-semibold mt-1">{property.area}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Property Age</p>
                <p className="text-gray-900 font-semibold mt-1">{property.age}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Submitted</p>
                <p className="text-gray-900 font-semibold mt-1">
                  {new Date(property.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {property.images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Images ({property.images.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.images.map((image, idx) => (
                  <div key={idx} className="aspect-square bg-gray-300 rounded-lg flex items-center justify-center">
                    <p className="text-gray-600 text-sm">{image}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brochure */}
          {property.brochure && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Brochure</h3>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path>
                </svg>
                <div>
                  <p className="text-gray-900 font-medium">{property.brochure}</p>
                  <p className="text-gray-500 text-sm">Brochure available for download</p>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Reason (if rejected) */}
          {property.status === 'rejected' && property.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Rejection Reason</h3>
              <p className="text-red-800">{property.rejectionReason}</p>
            </div>
          )}

          {/* Internal Notes */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h3>

            {/* Notes List */}
            {property.internalNotes.length > 0 && (
              <div className="mb-6 space-y-3 max-h-64 overflow-y-auto">
                {property.internalNotes.map(note => (
                  <div key={note.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-blue-900 font-medium">{note.text}</p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      {note.author} • {new Date(note.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Note Form */}
            {property.status !== 'live' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add internal notes about this property..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Add Note
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {property.status === 'submitted' && (
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>

              <div className="space-y-4">
                {/* Approve Button */}
                <div>
                  <button
                    onClick={() => setShowApproveOptions(!showApproveOptions)}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve Property
                    </span>
                  </button>

                  {showApproveOptions && (
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                      <p className="text-sm text-green-800 font-medium">Choose approval option:</p>
                      <button
                        onClick={() => {
                          onApprove(false);
                        }}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition"
                      >
                        Approve (Keep as Draft)
                      </button>
                      <button
                        onClick={() => {
                          onApprove(true);
                        }}
                        className="w-full bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm font-medium transition"
                      >
                        Approve & Go Live Immediately
                      </button>
                    </div>
                  )}
                </div>

                {/* Reject Button */}
                <div>
                  <button
                    onClick={() => setShowRejectForm(!showRejectForm)}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold transition"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject Property
                    </span>
                  </button>

                  {showRejectForm && (
                    <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                      <label className="block text-sm font-medium text-red-900 mb-2">
                        Rejection Reason (visible to builder):
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this property is being rejected..."
                        rows={4}
                        className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleReject}
                          disabled={!rejectionReason.trim()}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium text-sm"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => setShowRejectForm(false)}
                          className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Approved Properties - Publish Option */}
          {property.status === 'approved' && (
            <div className="border-t border-gray-200 pt-8 bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Ready to Publish</h3>
              <p className="text-green-800 mb-4">This property has been approved and is ready to go live on the platform.</p>
              <button
                onClick={onPublish}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Publish to Platform
                </span>
              </button>
            </div>
          )}

          {/* Live Properties */}
          {property.status === 'live' && (
            <div className="border-t border-gray-200 pt-8 bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Live on Platform
              </h3>
              <p className="text-blue-800 text-sm">
                Published on {property.liveDate ? new Date(property.liveDate).toLocaleDateString() : 'Unknown date'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
