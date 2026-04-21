import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const API_URL = 'http://localhost:3102';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AuthContextType {
    authenticated: boolean;
    user: any;
    roles: string[];
    activeRole: string | null;
    loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithOtp: (code: string, phone?: string, email?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    token: string | undefined;
    initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function base64Decode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    str = String(str).replace(/=+$/, '');
    if (str.length % 4 === 1) throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    for (
        let bc = 0, bs = 0, buffer, i = 0;
        (buffer = str.charAt(i++));
        ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
            ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
            : 0
    ) {
        buffer = chars.indexOf(buffer);
    }
    return output;
}

function decodeJwt(t: string): Record<string, any> | null {
    try {
        const base64Url = t.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = base64Decode(base64);
        const payload = JSON.parse(jsonPayload);
        return {
            ...payload,
            userId: payload.sub || payload.userId,
        };
    } catch (e) {
        console.error('JWT Decode Error:', e);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [activeRole, setActiveRole] = useState<string | null>(null);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [initialized, setInitialized] = useState(false);
    const router = useRouter();

    const hydrateFromToken = useCallback(async (newToken: string) => {
        await SecureStore.setItemAsync('auth_token', newToken);
        const payload = decodeJwt(newToken);
        if (!payload) return;

        const role: string | null = payload.activeRole || null;

        setToken(newToken);
        setUser(payload);
        setRoles(payload.roles || []);
        setActiveRole(role);
        setAuthenticated(true);
    }, []);

    useEffect(() => {
        async function loadStoredToken() {
            try {
                const storedToken = await SecureStore.getItemAsync('auth_token');
                if (storedToken) {
                    const payload = decodeJwt(storedToken);
                    if (payload) {
                        const now = Math.floor(Date.now() / 1000);
                        if (payload.exp > now) {
                            const role: string | null = payload.activeRole || null;
                            setAuthenticated(true);
                            setToken(storedToken);
                            setUser(payload);
                            setRoles(payload.roles || []);
                            setActiveRole(role);
                        } else {
                            await SecureStore.deleteItemAsync('auth_token');
                        }
                    }
                }
            } catch (e) {
                console.error('Error loading token:', e);
            } finally {
                setInitialized(true);
            }
        }
        loadStoredToken();
    }, []);

    const loginWithCredentials = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass }),
            });
            const data = await res.json();
            if (res.ok) {
                await hydrateFromToken(data.access_token);
                return { success: true };
            }
            return { success: false, error: data.message || 'Invalid credentials' };
        } catch (e) {
            return { success: false, error: 'Authentication server unavailable' };
        }
    };

    const loginWithOtp = async (code: string, phone?: string, email?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(`${API_URL}/auth/login-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, phone, email }),
            });
            const data = await res.json();
            if (res.ok) {
                await hydrateFromToken(data.access_token);
                return { success: true };
            }
            return { success: false, error: data.message || 'Invalid or expired OTP' };
        } catch (e) {
            return { success: false, error: 'Authentication server unavailable' };
        }
    };

    const logout = async () => {
        setAuthenticated(false);
        setUser(null);
        setRoles([]);
        setActiveRole(null);
        setToken(undefined);
        await SecureStore.deleteItemAsync('auth_token');
        router.replace('/');
    };

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                roles,
                activeRole,
                loginWithCredentials,
                loginWithOtp,
                logout,
                token,
                initialized,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
