'use client';
import { setCookie, deleteCookie } from 'cookies-next';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
    authenticated: boolean;
    user: any;
    roles: string[];
    login: () => void;
    loginWithCredentials: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    token: string | undefined;
    initialized: boolean;
    profileStatus: any;
    refreshProfileStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [initialized, setInitialized] = useState(false);
    const [profileStatus, setProfileStatus] = useState<any>(null);

    const refreshProfileStatus = async (authToken?: string) => {
        const currentToken = authToken || localStorage.getItem('auth_token');
        if (!currentToken) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/me/profile-status`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProfileStatus(data);
            }
        } catch (error) {
            console.error('Failed to fetch profile status:', error);
        }
    };

    const decodeToken = (t: string) => {
        try {
            const base64Url = t.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));

            // Normalize the payload to have a consistent structure including userId
            const normalized = {
                ...payload,
                userId: payload.sub || payload.userId,
                firstName: payload.firstName,
                lastName: payload.lastName,
                roles: payload.roles || [],
                primaryRole: payload.primaryRole,
            };

            return normalized;
        } catch (e) {
            console.error('Failed to decode token:', e);
            return null;
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            const payload = decodeToken(storedToken);
            if (payload) {
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp > now) {
                    setAuthenticated(true);
                    setToken(storedToken);
                    setUser(payload);
                    setRoles(payload.roles || []);
                    // Only set initial cookie if it doesn't exist, to avoid overwriting user persistence
                    const existingRoleCookie = document.cookie.split('; ').find(row => row.startsWith('user_role='))?.split('=')[1];
                    if (!existingRoleCookie) {
                        if (payload.primaryRole) {
                            setCookie('user_role', payload.primaryRole, { maxAge: 60 * 60 * 24 * 7, path: '/' });
                        } else if (payload.roles && payload.roles.length > 0) {
                            setCookie('user_role', payload.roles[0], { maxAge: 60 * 60 * 24 * 7, path: '/' });
                        }
                    }
                    refreshProfileStatus(storedToken);
                } else {
                    localStorage.removeItem('auth_token');
                }
            }
        }
        setInitialized(true);
    }, []);

    const loginWithCredentials = async (email: string, pass: string) => {
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password: pass }),
            });

            const data = await response.json();

            if (response.ok) {
                const { access_token } = data;
                localStorage.setItem('auth_token', access_token);

                const payload = decodeToken(access_token);

                setAuthenticated(true);
                setToken(access_token);
                setUser(payload);
                setRoles(payload?.roles || []);

                if (payload?.primaryRole) {
                    setCookie('user_role', payload.primaryRole, { maxAge: 60 * 60 * 24 * 7, path: '/' });
                }

                refreshProfileStatus(access_token);
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Invalid credentials' };
            }
        } catch (err) {
            return { success: false, error: 'Authentication server unavailable' };
        }
    };

    const login = () => {
        window.location.href = '/signin';
    };

    const logout = () => {
        setAuthenticated(false);
        setUser(null);
        setRoles([]);
        setToken(undefined);
        localStorage.removeItem('auth_token');
        deleteCookie('user_role', { path: '/' });
        window.location.href = '/signin';
    };

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                roles,
                login,
                loginWithCredentials,
                logout,
                token,
                initialized,
                profileStatus,
                refreshProfileStatus: () => refreshProfileStatus(),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
