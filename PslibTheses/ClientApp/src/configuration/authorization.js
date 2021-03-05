export const IDENTITY_CONFIGURATION = {
    authority: process.env.REACT_APP_AUTH_URL,
    client_id: process.env.REACT_APP_IDENTITY_CLIENT_ID,
    redirect_uri: process.env.REACT_APP_CLIENT_URL + "/oidc-callback",
    login: process.env.REACT_APP_AUTH_URL + "/oauth2/authorize",
    automaticSilentRenew: true,
    loadUserInfo: true,
    silent_redirect_uri: process.env.REACT_APP_CLIENT_URL + "/oidc-silent-renew",
    post_logout_redirect_uri: process.env.REACT_APP_CLIENT_URL + "/oidc-signout-callback",
    response_type: "code",
    scope: "openid profile email ThesesApi IdentityServerApi",
    webAuthResponseType: "id_token token",
    filterProtocolClaims: true,
}

export const METADATA_OIDC = {
    issuer: process.env.REACT_APP_AUTH_URL,
    jwks_uri: process.env.REACT_APP_AUTH_URL + "/.well-known/openid-configuration/jwks",
    authorization_endpoint: process.env.REACT_APP_AUTH_URL + "/connect/authorize",
    token_endpoint: process.env.REACT_APP_AUTH_URL + "/connect/token",
    userinfo_endpoint: process.env.REACT_APP_AUTH_URL + "/connect/userinfo",
    end_session_endpoint: process.env.REACT_APP_AUTH_URL + "/connect/endsession",
    check_session_iframe: process.env.REACT_APP_AUTH_URL + "/connect/checksession",
    revocation_endpoint: process.env.REACT_APP_AUTH_URL + "/connect/revocation",
    introspection_endpoint: process.env.REACT_APP_AUTH_URL + "/connect/introspect"
}