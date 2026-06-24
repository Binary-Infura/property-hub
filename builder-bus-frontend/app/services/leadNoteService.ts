import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3102/api';

export interface LeadNote {
    id: string;
    leadId: string;
    authorId: string;
    content: string;
    category: 'GENERAL' | 'PREFERENCE' | 'BUDGET' | 'LEGAL' | 'FOLLOW_UP';
    createdAt: string;
    author: {
        id: string;
        name: string;
        email: string;
    };
}

export const leadNoteService = {
    async addNote(token: string, leadId: string, content: string, category: string): Promise<LeadNote> {
        const response = await axios.post(
            `${API_URL}/leads/${leadId}/notes`,
            {
                content,
                category: category.toUpperCase().replace('-', '_')
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;
    },

    async getNotes(token: string, leadId: string): Promise<LeadNote[]> {
        const response = await axios.get(
            `${API_URL}/leads/${leadId}/notes`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        return response.data;
    },

    async deleteNote(token: string, leadId: string, noteId: string): Promise<void> {
        await axios.delete(
            `${API_URL}/leads/${leadId}/notes/${noteId}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
    }
};
