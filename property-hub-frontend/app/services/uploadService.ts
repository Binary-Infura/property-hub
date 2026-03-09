const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const uploadService = {
    async uploadFile(file: File, token: string, category: string, name: string): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('name', name);

        const response = await fetch(`${API_URL}/api/uploads`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to upload file');
        }

        const data = await response.json();
        return data.url;
    }
};
