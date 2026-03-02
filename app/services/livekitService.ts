import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const livekitService = {
    getToken: async (token: string, roomName: string) => {
        const response = await axios.get(`${API_URL}/livekit/token/${roomName}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.token;
    },

    getPublicToken: async (roomName: string) => {
        const response = await axios.get(`${API_URL}/livekit/public-token/${roomName}`);
        return response.data.token;
    },
};
