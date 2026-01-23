import Keycloak from 'keycloak-js';

const keycloakConfig = {
    // Using relative path via proxy to hide the Keycloak server from the browser origin
    url: typeof window !== 'undefined' ? `${window.location.origin}/auth` : 'http://localhost:8080/realms/property-hub/protocol/openid-connect',
    realm: 'property-hub',
    clientId: 'property-hub-frontend',
};

// NOTE: When using proxy, keycloak-js might need special handling
// For this "Hidden" requirement, we'll keep the direct URL for background init 
// but use the Proxy for our manual fetch-based login.

let keycloak: Keycloak | null = null;

if (typeof window !== 'undefined') {
    keycloak = new Keycloak({
        url: `${window.location.origin}/keycloak`,
        realm: 'property-hub',
        clientId: 'property-hub-frontend'
    });
}

export default keycloak;
