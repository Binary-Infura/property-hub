const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Invitation {
  id: string;
  email?: string;
  phone?: string;
  roles: string[];
  token: string;
  type: 'PLATFORM' | 'THIRD_PARTY';
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  invitedById: string;
  expiresAt: string;
  createdAt: string;
}

export const invitationService = {
  async invite(data: { email?: string; phone?: string; roles: string[]; type: 'PLATFORM' | 'THIRD_PARTY' }, token: string): Promise<Invitation> {
    const response = await fetch(`${API_URL}/api/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send invitation');
    }

    return response.json();
  },

  async verify(token: string): Promise<Invitation> {
    const response = await fetch(`${API_URL}/api/invitations/verify?token=${token}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invitation is invalid or expired');
    }

    return response.json();
  },

  async register(data: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/invitations/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete registration');
    }

    return response.json();
  },
};
