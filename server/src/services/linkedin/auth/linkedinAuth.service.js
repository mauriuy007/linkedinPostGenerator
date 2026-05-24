import crypto from 'crypto';

const LINKEDIN_AUTH_URL   = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL  = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

const STATE_COOKIE_NAME          = 'linkedin_oauth_state';
const ACCESS_TOKEN_COOKIE_NAME   = 'linkedin_access_token';
const MEMBER_URN_COOKIE_NAME     = 'linkedin_member_urn';
const PROFILE_NAME_COOKIE_NAME   = 'linkedin_profile_name';
const PROFILE_PICTURE_COOKIE_NAME = 'linkedin_profile_picture';
const PROFILE_ID_COOKIE_NAME     = 'linkedin_profile_id';

const STATE_COOKIE_MAX_AGE_SECONDS   = 10 * 60;
const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60;

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const getFrontendUrl = () => process.env.FRONTEND_URL ?? 'http://localhost:5173';

const getRequiredEnv = () => {
  const clientId     = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri  = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('LinkedIn OAuth environment variables are not fully configured');
  }

  return { clientId, clientSecret, redirectUri };
};

const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map(c => c.trim())
    .filter(Boolean)
    .reduce((acc, cookie) => {
      const sep = cookie.indexOf('=');
      if (sep === -1) return acc;
      acc[cookie.slice(0, sep)] = decodeURIComponent(cookie.slice(sep + 1));
      return acc;
    }, {});

const buildCookie = (name, value, req, options = {}) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `SameSite=${options.sameSite ?? 'Lax'}`,
    `Max-Age=${options.maxAge ?? DEFAULT_SESSION_MAX_AGE_SECONDS}`,
  ];
  if (options.httpOnly ?? true) parts.push('HttpOnly');
  if (isSecure) parts.push('Secure');
  return parts.join('; ');
};

const buildClearCookie = (name, req) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const parts = [`${name}=`, 'Path=/', 'SameSite=Lax', 'Max-Age=0', 'HttpOnly'];
  if (isSecure) parts.push('Secure');
  return parts.join('; ');
};

/* ─── Exports ──────────────────────────────────────────────────────────── */

export const buildFrontendRedirectUrl = (pathname = '/', params = {}) => {
  const url = new URL(pathname, getFrontendUrl());
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
};

export const generateOAuthState = () => crypto.randomUUID();

export const buildOAuthLoginUrl = state => {
  const { clientId, redirectUri } = getRequiredEnv();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile email w_member_social',
    state,
  });
  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
};

export const getStoredOAuthState = req => {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[STATE_COOKIE_NAME] ?? null;
};

export const buildStateCookieHeader = (state, req) =>
  buildCookie(STATE_COOKIE_NAME, state, req, {
    maxAge: STATE_COOKIE_MAX_AGE_SECONDS,
    httpOnly: true,
  });

export const clearStateCookieHeader = req => buildClearCookie(STATE_COOKIE_NAME, req);

export const buildSessionCookieHeaders = (
  { accessToken, memberUrn, displayName, picture, linkedinId, maxAge },
  req
) => [
  buildCookie(ACCESS_TOKEN_COOKIE_NAME,    accessToken,        req, { maxAge, httpOnly: true }),
  buildCookie(MEMBER_URN_COOKIE_NAME,      memberUrn,          req, { maxAge, httpOnly: true }),
  buildCookie(PROFILE_NAME_COOKIE_NAME,    displayName ?? '',  req, { maxAge, httpOnly: true }),
  buildCookie(PROFILE_PICTURE_COOKIE_NAME, picture ?? '',      req, { maxAge, httpOnly: true }),
  buildCookie(PROFILE_ID_COOKIE_NAME,      linkedinId ?? '',   req, { maxAge, httpOnly: true }),
];

export const clearSessionCookieHeaders = req => [
  buildClearCookie(ACCESS_TOKEN_COOKIE_NAME,    req),
  buildClearCookie(MEMBER_URN_COOKIE_NAME,      req),
  buildClearCookie(PROFILE_NAME_COOKIE_NAME,    req),
  buildClearCookie(PROFILE_PICTURE_COOKIE_NAME, req),
  buildClearCookie(PROFILE_ID_COOKIE_NAME,      req),
];

export const getLinkedinSessionFromRequest = req => {
  const cookies = parseCookies(req.headers.cookie);
  const accessToken = cookies[ACCESS_TOKEN_COOKIE_NAME];
  const memberUrn   = cookies[MEMBER_URN_COOKIE_NAME];

  if (!accessToken || !memberUrn) return null;

  return {
    accessToken,
    memberUrn,
    displayName: cookies[PROFILE_NAME_COOKIE_NAME]    ?? '',
    picture:     cookies[PROFILE_PICTURE_COOKIE_NAME] ?? '',
    linkedinId:  cookies[PROFILE_ID_COOKIE_NAME]      ?? '',
  };
};

export const exchangeCodeForToken = async code => {
  const { clientId, clientSecret, redirectUri } = getRequiredEnv();
  const params = new URLSearchParams({
    grant_type:    'authorization_code',
    code,
    redirect_uri:  redirectUri,
    client_id:     clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params,
  });
  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error('Failed to exchange authorization code for LinkedIn access token');
  }

  return {
    accessToken: data.access_token,
    expiresIn: Number.isFinite(data.expires_in)
      ? data.expires_in
      : DEFAULT_SESSION_MAX_AGE_SECONDS,
  };
};

export const fetchLinkedinUserInfo = async accessToken => {
  const response = await fetch(LINKEDIN_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();

  if (!response.ok || !data.sub) {
    throw new Error('Failed to fetch LinkedIn user profile');
  }

  return {
    linkedinId:  data.sub,
    memberUrn:   `urn:li:person:${data.sub}`,
    displayName: data.name
      ?? [data.given_name, data.family_name].filter(Boolean).join(' ')
      ?? '',
    picture: data.picture ?? '',
  };
};
