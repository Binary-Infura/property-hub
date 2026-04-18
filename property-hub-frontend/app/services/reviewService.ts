import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3102";

export interface Review {
    id: string;
    content: string;
    rating: number;
    authorId: string;
    authorName: string;
    authorRole: string;
    isApproved: boolean;
    showOnHomepage: boolean;
    createdAt: string;
}

export interface CreateReviewDto {
    content: string;
    rating: number;
    authorRole: string;
}

const getAuthHeader = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const reviewService = {
    async getApprovedReviews(): Promise<Review[]> {
        const response = await axios.get(`${API_URL}/reviews/approved`);
        return response.data;
    },

    async getHomepageReviews(): Promise<Review[]> {
        const response = await axios.get(`${API_URL}/reviews/homepage`);
        return response.data;
    },

    async getPendingReviews(): Promise<Review[]> {
        const response = await axios.get(`${API_URL}/reviews/pending`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async createReview(data: CreateReviewDto): Promise<Review> {
        const response = await axios.post(`${API_URL}/reviews`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async toggleVisibility(id: string): Promise<Review> {
        const response = await axios.patch(`${API_URL}/reviews/${id}/toggle-visibility`, {}, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async toggleHomepageVisibility(id: string): Promise<Review> {
        const response = await axios.patch(`${API_URL}/reviews/${id}/toggle-homepage`, {}, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async deleteReview(id: string): Promise<Review> {
        const response = await axios.delete(`${API_URL}/reviews/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },
};
