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
    profileStatus: any;
    refreshProfileStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize state from localStorage immediately to prevent flickers
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [initialized, setInitialized] = useState(false);
    const [profileStatus, setProfileStatus] = useState<any>(null);

    const refreshProfileStatus = async () => {
        const storedToken = localStorage.getItem('kc_token') || token;
        if (!storedToken) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/users/me/profile-status`, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`
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

        // Use different init strategy based on whether we have stored tokens
        // When tokens are present, we skip SSO check and trust the stored tokens
        const hasStoredTokens = !!(storedToken && storedRefreshToken);

        const initOptions: any = {
            onLoad: 'check-sso',
            checkLoginIframe: false, // Disable iframe check for credential-based login
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
                if (!kc) return;

                // For Direct Grant logins, Keycloak may not set cookies, so 'auth' might be false
                // but if we have valid tokens in storage (and kc has processed them), we consider it authenticated
                const isActuallyAuthenticated = auth || (hasStoredTokens && !!kc.token);

                if (isActuallyAuthenticated) {
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

                // If initialization fails but we have tokens and were previously authenticated (pre-flight)
                // we try to maintain the session if tokens are still valid
                if (hasStoredTokens && authenticated) {
                    console.log('Init failed but tokens present - maintaining session');
                    setInitialized(true);
                } else {
                    handleAuthFailure();
                    setInitialized(true);
                }
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

        // Fetch profile status
        refreshProfileStatus();

        // Persist tokens
        if (kc.token) localStorage.setItem('kc_token', kc.token);
        if (kc.refreshToken) localStorage.setItem('kc_refreshToken', kc.refreshToken);
        if (kc.idToken) localStorage.setItem('kc_idToken', kc.idToken);

        // Ensure timeskew is calculated for proper token expiration detection
        if (kc.tokenParsed && typeof kc.timeSkew === 'undefined') {
            const now = Math.floor(Date.now() / 1000);
            const iat = kc.tokenParsed.iat || now;
            kc.timeSkew = Math.floor(now - iat);
            console.log('Timeskew initialized:', kc.timeSkew);
        }

        // Setup refresh interval (clear existing first)
        if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = setInterval(() => {
            // Check if we have a refresh token before attempting refresh
            if (!kc.refreshToken) {
                console.warn('No refresh token available, skipping refresh');
                return;
            }

            kc.updateToken(70).then((refreshed) => {
                if (refreshed) {
                    console.log('Token refreshed successfully');
                    setToken(kc.token);
                    if (kc.token) localStorage.setItem('kc_token', kc.token);
                    if (kc.refreshToken) localStorage.setItem('kc_refreshToken', kc.refreshToken);
                    if (kc.idToken) localStorage.setItem('kc_idToken', kc.idToken);
                } else {
                    console.log('Token still valid, no refresh needed');
                }
            }).catch((error) => {
                console.error('Failed to refresh token during interval:', error);
                // If refresh fails, the session is likely invalid - clean up
                console.warn('Session appears invalid, cleaning up...');
                handleAuthFailure();
            });
        }, 60000);
    };

    const handleAuthFailure = () => {
        console.log('--- SESSION INVALIDATED ---');
        setAuthenticated(false);
        setToken(undefined);
        setUser(null);
        setRoles([]);
        setProfileStatus(null);
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
                console.log('Received tokens:', {
                    access: !!data.access_token,
                    refresh: !!data.refresh_token,
                    id: !!data.id_token
                });

                if (!data.refresh_token) {
                    console.warn('WARNING: No refresh token received! Session will not auto-refresh.');
                }

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

                    // Initialize timeskew to prevent "Unable to determine if token is expired" errors
                    if (keycloak.tokenParsed) {
                        const now = Math.floor(Date.now() / 1000);
                        const iat = keycloak.tokenParsed.iat || now;
                        keycloak.timeSkew = Math.floor(now - iat);
                        console.log('Timeskew set after login:', keycloak.timeSkew);
                    }
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

        const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/signin` : '';
        keycloak?.logout({ redirectUri });
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
                refreshProfileStatus,
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
