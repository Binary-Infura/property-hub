'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import keycloak from '../lib/keycloak';

interface AuthContextType {
    authenticated: boolean;
    user: any;
    roles: string[];
    login: () => void;
    loginWithCredentials: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    token: string | undefined;
    initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize state from localStorage immediately to prevent flickers
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [initialized, setInitialized] = useState(false);

    const refreshIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

    // 1. PHASE ONE: Pre-flight recovery (Immediate)
    useEffect(() => {
        const storedToken = localStorage.getItem('kc_token');
        console.log('--- PRE-FLIGHT CHECK ---');
        console.log('Stored Token:', storedToken ? 'Found' : 'Missing');

        if (storedToken) {
            try {
                const base64Url = storedToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));

                const now = Math.floor(Date.now() / 1000);
                const isExpired = payload.exp <= now;
                console.log('Token Expiration:', new Date(payload.exp * 1000).toLocaleString());
                console.log('Is Expired:', isExpired);

                if (!isExpired) {
                    console.log('--- RESTORING PRE-FLIGHT STATE ---');
                    setAuthenticated(true);
                    setToken(storedToken);
                    setUser(payload);
                    setRoles(payload.realm_access?.roles || []);
                } else {
                    console.warn('Stored token is expired.');
                }
            } catch (e) {
                console.error('Pre-flight parse failed:', e);
            }
        }

        return () => {
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
        };
    }, []);

    // 2. PHASE TWO: Full Keycloak Initialization (Background/Verification)
    useEffect(() => {
        if (!keycloak) return;

        const storedToken = localStorage.getItem('kc_token');
        const storedRefreshToken = localStorage.getItem('kc_refreshToken');
        const storedIdToken = localStorage.getItem('kc_idToken');

        console.log('--- KEYCLOAK INIT START ---');

        const initOptions: any = {
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : '',
            pkceMethod: 'S256',
            token: storedToken || undefined,
            refreshToken: storedRefreshToken || undefined,
            idToken: storedIdToken || undefined,
            enableLogging: true,
        };

        keycloak
            .init(initOptions)
            .then((auth) => {
                console.log('--- KEYCLOAK INIT COMPLETE ---');
                console.log('Init result (auth):', auth);

                const kc = keycloak;
                const hasValidToken = !!(kc && kc.token);
                console.log('KC Token present after init:', hasValidToken);

                if (auth || hasValidToken) {
                    console.log('Verification successful.');
                    handleAuthSuccess();
                } else {
                    console.log('Verification failed or session invalid.');
                    handleAuthFailure();
                }
                setInitialized(true);
            })
            .catch((err) => {
                console.error('--- KEYCLOAK RECOVERY FAILED ---', err);
                // On error, we trust our pre-flight check if it was already successful
                setInitialized(true);
            });
    }, []);

    const handleAuthSuccess = () => {
        const kc = keycloak;
        if (!kc) return;

        console.log('--- SESSION VERIFIED ---');
        setAuthenticated(true);
        setToken(kc.token);
        setUser(kc.idTokenParsed);
        const userRoles = kc.realmAccess?.roles || [];
        setRoles(userRoles);

        // Persist tokens
        if (kc.token) localStorage.setItem('kc_token', kc.token);
        if (kc.refreshToken) localStorage.setItem('kc_refreshToken', kc.refreshToken);
        if (kc.idToken) localStorage.setItem('kc_idToken', kc.idToken);

        // Setup refresh interval (clear existing first)
        if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = setInterval(() => {
            kc.updateToken(70).then((refreshed) => {
                if (refreshed) {
                    console.log('Token refreshed naturally');
                    setToken(kc.token);
                    if (kc.token) localStorage.setItem('kc_token', kc.token);
                    if (kc.refreshToken) localStorage.setItem('kc_refreshToken', kc.refreshToken);
                    if (kc.idToken) localStorage.setItem('kc_idToken', kc.idToken);
                }
            }).catch(() => {
                console.error('Failed to refresh token during interval');
            });
        }, 60000);
    };

    const handleAuthFailure = () => {
        console.log('--- SESSION INVALIDATED ---');
        setAuthenticated(false);
        setToken(undefined);
        setUser(null);
        setRoles([]);
        localStorage.removeItem('kc_token');
        localStorage.removeItem('kc_refreshToken');
        localStorage.removeItem('kc_idToken');
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }
    };

    const loginWithCredentials = async (username: string, password: string) => {
        try {
            console.log(`Attempting headless login for: ${username}`);
            // Proxying through our Next.js rewrite for Keycloak security
            const response = await fetch('/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'password',
                    client_id: 'property-hub-frontend',
                    username: username,
                    password: password,
                    scope: 'openid profile email roles',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login request successful');

                if (keycloak) {
                    keycloak.token = data.access_token;
                    keycloak.refreshToken = data.refresh_token;
                    keycloak.idToken = data.id_token;

                    // Manually parse tokens for immediate state update
                    const parseJwt = (token: string) => {
                        try {
                            const base64Url = token.split('.')[1];
                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                            return JSON.parse(window.atob(base64));
                        } catch (e) {
                            return null;
                        }
                    };

                    keycloak.tokenParsed = parseJwt(data.access_token);
                    keycloak.idTokenParsed = parseJwt(data.id_token);
                    keycloak.realmAccess = keycloak.tokenParsed?.realm_access;
                }

                // Use the centralized success handler to set state and persist
                handleAuthSuccess();

                return { success: true };
            } else {
                console.error('Login request failed:', data.error_description);
                return { success: false, error: data.error_description || 'Invalid credentials' };
            }
        } catch (err) {
            console.error('Auth fetch error:', err);
            return { success: false, error: 'Authentication server unavailable' };
        }
    };

    const login = () => keycloak?.login();
    const logout = () => {
        setAuthenticated(false);
        setUser(null);
        setRoles([]);
        setToken(undefined);
        localStorage.removeItem('kc_token');
        localStorage.removeItem('kc_refreshToken');
        localStorage.removeItem('kc_idToken');
        keycloak?.logout({ redirectUri: window.location.origin });
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
