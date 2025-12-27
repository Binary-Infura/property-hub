'use client';

import { useState } from 'react';

interface Client {
  id: string;
  name: string;
}

interface Note {
  id: string;
  clientId: string;
  content: string;
  createdAt: Date;
  category: 'general' | 'preference' | 'budget' | 'legal' | 'follow-up';
}

interface ConsultantNotesProps {
  notes: Note[];
  clients: Client[];
  selectedClientId: string | null;
  onAddNote: (clientId: string, content: string, category: string) => void;
}

export default function ConsultantNotes({
  notes,
  clients,
  selectedClientId,
  onAddNote,
}: ConsultantNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Note['category']>('general');
  const [filterCategory, setFilterCategory] = useState<Note['category'] | 'all'>('all');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  const getCategoryColor = (category: Note['category']) => {
    switch (category) {
      case 'general':
        return 'bg-gray-100 text-gray-700';
      case 'preference':
        return 'bg-blue-100 text-blue-700';
      case 'budget':
        return 'bg-green-100 text-green-700';
      case 'legal':
        return 'bg-red-100 text-red-700';
      case 'follow-up':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: Note['category']) => {
    switch (category) {
      case 'general':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2v12a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 000-2 2 2 0 00-2 2v12H4V5zm9 0a1 1 0 100 2h2a1 1 0 100-2h-2z" clipRule="evenodd"></path>
          </svg>
        );
      case 'preference':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
          </svg>
        );
      case 'budget':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.16 5.314l4.897-1.596A1 1 0 0115 4.001v12.998a1 1 0 01-1.037.996l-4.897-1.596.541 1.622h1.037A2 2 0 0013 19H7a2 2 0 01-2-2V7a2 2 0 012-2h1.037l.541 1.622z"></path>
          </svg>
        );
      case 'legal':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
          </svg>
        );
      case 'follow-up':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1411.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 105.199 7.09V4a1 1 0 01-1-1H4zm7 4a1 1 0 011 1v3.101a1 1 0 11-2 0V7a1 1 0 011-1z" clipRule="evenodd"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim() && selectedClientId) {
      onAddNote(selectedClientId, newNote, selectedCategory);
      setNewNote('');
      setSelectedCategory('general');
    }
  };

  const filteredNotes = notes.filter(note => {
    if (selectedClientId && note.clientId !== selectedClientId) return false;
    if (filterCategory !== 'all' && note.category !== filterCategory) return false;
    return true;
  });

  const categories: Note['category'][] = ['general', 'preference', 'budget', 'legal', 'follow-up'];

  return (
    <div className="space-y-8">
      {/* Add New Note Form */}
      {selectedClientId && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add Note for {getClientName(selectedClientId)}</h3>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Note Content</label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note here..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as Note['category'])}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
                >
                  Add Note
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Notes ({filteredNotes.length})</h3>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
              filterCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
                filterCategory === cat
                  ? `${getCategoryColor(cat)} shadow-md`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 font-medium">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map(note => (
            <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(note.category)}`}>
                    {getCategoryIcon(note.category)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{getClientName(note.clientId)}</p>
                    <p className="text-xs text-gray-500">{formatDate(note.createdAt)}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(note.category)}`}>
                  {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed">{note.content}</p>

              <div className="mt-4 flex gap-2">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition">Edit</button>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
