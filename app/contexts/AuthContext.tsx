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
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!keycloak) return;

        keycloak
            .init({
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: typeof window !== 'undefined' ? window.location.origin + '/silent-check-sso.html' : '',
                pkceMethod: 'S256',
            })
            .then((auth) => {
                handleAuthChange(auth);
                setInitialized(true);
            })
            .catch((err) => {
                console.error('Keycloak init failed', err);
                setInitialized(true);
            });
    }, []);

    const handleAuthChange = (auth: boolean) => {
        setAuthenticated(auth);
        if (auth && keycloak) {
            setToken(keycloak.token);
            setUser(keycloak.idTokenParsed);
            const userRoles = keycloak.realmAccess?.roles || [];
            setRoles(userRoles);

            console.log('--- AUTH STATE UPDATED ---');
            console.log('User:', keycloak.idTokenParsed?.preferred_username);
            console.log('Roles found:', userRoles);

            const interval = setInterval(() => {
                keycloak.updateToken(70).then((refreshed) => {
                    if (refreshed) {
                        setToken(keycloak.token);
                    }
                }).catch(() => {
                    console.error('Failed to refresh token');
                });
            }, 60000);

            return () => clearInterval(interval);
        }
    };

    const loginWithCredentials = async (username: string, password: string) => {
        try {
            console.log(`Attempting headless login for: ${username}`);
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
                setToken(data.access_token);
                setAuthenticated(true);

                const base64Url = data.access_token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));

                const decodedRoles = payload.realm_access?.roles || [];
                console.log('Roles in token:', decodedRoles);

                setUser(payload);
                setRoles(decodedRoles);

                return { success: true };
            } else {
                console.error('Login request failed:', data.error_description);
                return { success: false, error: data.error_description || 'Invalid username or password' };
            }
        } catch (err) {
            console.error('Auth fetch error:', err);
            return { success: false, error: 'Auth server unavailable' };
        }
    };

    const login = () => keycloak?.login();
    const logout = () => {
        setAuthenticated(false);
        setUser(null);
        setRoles([]);
        setToken(undefined);
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
