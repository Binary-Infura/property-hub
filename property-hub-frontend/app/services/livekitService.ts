import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3102';
const LIVEKIT_API_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

export const livekitService = {
    getToken: async (token: string, roomName: string) => {
        const response = await axios.get(`${LIVEKIT_API_URL}/livekit/token/${roomName}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.token;
    },

    getPublicToken: async (roomName: string) => {
        const response = await axios.get(`${LIVEKIT_API_URL}/livekit/public-token/${roomName}`);
        return response.data.token;
    },
};
