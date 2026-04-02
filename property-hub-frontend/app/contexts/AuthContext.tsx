'use client';

import { setCookie, deleteCookie } from 'cookies-next';
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AuthContextType {
    authenticated: boolean;
    user: any;
    roles: string[];
    /** The currently active role — derived entirely from the JWT. Single source of truth. */
    activeRole: string | null;
    login: () => void;
    loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithOtp: (code: string, phone?: string, email?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    /**
     * Updates the stored token and syncs all derived state (user, roles, activeRole, cookie).
     * Call this after any operation that issues a new JWT (login, switch-role).
     */
    refreshAuthToken: (newToken: string) => void;
    /**
     * Switches the active role via the backend, refreshes the JWT, and navigates to /dashboard.
     * This is the ONLY place role switching should be initiated.
     */
    switchRole: (newRoleId: string) => Promise<void>;
    token: string | undefined;
    initialized: boolean;
    profileStatus: any;
    refreshProfileStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function decodeJwt(t: string): Record<string, any> | null {
    try {
        const base64Url = t.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return {
            ...payload,
            // Normalize: always expose `userId` regardless of which claim the token uses
            userId: payload.sub || payload.userId,
        };
    } catch {
        return null;
    }
}

function syncRoleCookie(role: string | null) {
    if (role) {
        setCookie('user_role', role, { maxAge: 60 * 60 * 24 * 7, path: '/' });
    } else {
        deleteCookie('user_role', { path: '/' });
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
    const [profileStatus, setProfileStatus] = useState<any>(null);

    // ------------------------------------------------------------------
    // Profile status
    // ------------------------------------------------------------------
    const refreshProfileStatus = useCallback(async (authToken?: string) => {
        const t = authToken || localStorage.getItem('auth_token');
        if (!t) return;
        try {
            const res = await fetch(`${API_URL}/api/users/me/profile-status`, {
                headers: { Authorization: `Bearer ${t}` },
            });
            if (res.ok) setProfileStatus(await res.json());
        } catch { /* non-critical */ }
    }, []);

    // ------------------------------------------------------------------
    // Core token hydration — call this whenever the JWT changes
    // ------------------------------------------------------------------
    const hydrateFromToken = useCallback((newToken: string, skipStateUpdate: boolean = false) => {
        localStorage.setItem('auth_token', newToken);
        const payload = decodeJwt(newToken);
        if (!payload) return;

        const role: string | null = payload.activeRole || null;

        // Always sync cookie first (synchronous, available on next request immediately)
        syncRoleCookie(role);

        if (skipStateUpdate) return;

        // Batch all state updates into a single render to prevent intermediate flickers.
        React.startTransition(() => {
            setToken(newToken);
            setUser(payload);
            setRoles(payload.roles || []);
            setActiveRole(role);
        });
    }, []);

    // Public alias (used by components after login / switch-role)
    const refreshAuthToken = useCallback((newToken: string) => {
        hydrateFromToken(newToken);
    }, [hydrateFromToken]);

    // ------------------------------------------------------------------
    // Initialise from localStorage on mount
    // ------------------------------------------------------------------
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            const payload = decodeJwt(storedToken);
            if (payload) {
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp > now) {
                    // Valid token — hydrate state and always overwrite cookie from JWT
                    const role: string | null = payload.activeRole || null;
                    setAuthenticated(true);
                    setToken(storedToken);
                    setUser(payload);
                    setRoles(payload.roles || []);
                    setActiveRole(role);
                    syncRoleCookie(role);   // ← always sync, never skip
                    refreshProfileStatus(storedToken);
                } else {
                    // Expired token — clear everything
                    localStorage.removeItem('auth_token');
                    deleteCookie('user_role', { path: '/' });
                }
            }
        }
        setInitialized(true);
    }, [refreshProfileStatus]);

    // ------------------------------------------------------------------
    // Login
    // ------------------------------------------------------------------
    const loginWithCredentials = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass }),
            });
            const data = await res.json();
            if (res.ok) {
                hydrateFromToken(data.access_token);
                setAuthenticated(true);
                refreshProfileStatus(data.access_token);
                return { success: true };
            }
            return { success: false, error: data.message || 'Invalid credentials' };
        } catch {
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
                hydrateFromToken(data.access_token);
                setAuthenticated(true);
                refreshProfileStatus(data.access_token);
                return { success: true };
            }
            return { success: false, error: data.message || 'Invalid or expired OTP' };
        } catch {
            return { success: false, error: 'Authentication server unavailable' };
        }
    };

    const login = () => { window.location.href = '/signin'; };

    // ------------------------------------------------------------------
    // Logout
    // ------------------------------------------------------------------
    const logout = () => {
        setAuthenticated(false);
        setUser(null);
        setRoles([]);
        setActiveRole(null);
        setToken(undefined);
        localStorage.removeItem('auth_token');
        deleteCookie('user_role', { path: '/' });
        window.location.href = '/signin';
    };

    // ------------------------------------------------------------------
    // switchRole — THE single code path for role switching
    // ------------------------------------------------------------------
    const switchRole = useCallback(async (newRoleId: string): Promise<void> => {
        // Always read from localStorage — React state may lag behind
        const currentToken = localStorage.getItem('auth_token');
        if (!currentToken) {
            throw new Error('No auth token found. Please log in again.');
        }

        const res = await fetch(`${API_URL}/auth/switch-role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify({ activeRole: newRoleId }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Failed to switch role (HTTP ${res.status})`);
        }

        const data = await res.json();
        if (!data.access_token) {
            throw new Error('Backend did not return a new token.');
        }

        // Verify the new token actually has the expected activeRole
        const newPayload = decodeJwt(data.access_token);
        if (!newPayload || newPayload.activeRole !== newRoleId) {
            throw new Error(`Token mismatch: expected ${newRoleId}, got ${newPayload?.activeRole}`);
        }

        // Update localStorage and cookie, but SKIP React state update.
        // This prevents the underlying page from re-rendering or redirecting
        // before the full page reload (window.location.href) happens.
        hydrateFromToken(data.access_token, true);
    }, [hydrateFromToken]);

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                roles,
                activeRole,
                login,
                loginWithCredentials,
                loginWithOtp,
                logout,
                refreshAuthToken,
                switchRole,
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
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
