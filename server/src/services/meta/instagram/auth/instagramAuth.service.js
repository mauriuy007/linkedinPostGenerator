import crypto from 'crypto';
import { parseCookies, buildCookie, buildClearCookie } from '../../../../utils/cookies.js';

const INSTAGRAM_AUTH_URL = 'https://www.instagram.com/oauth/authorize';
const INSTAGRAM_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const INSTAGRAM_LONG_LIVED_TOKEN_URL = 'https://graph.instagram.com/access_token';
const INSTAGRAM_GRAPH_BASE_URL = 'https://graph.instagram.com';

const OAUTH_SCOPE = 'instagram_business_basic,instagram_business_content_publish';

const STATE_COOKIE_NAME       = 'instagram_oauth_state';
const ACCESS_TOKEN_COOKIE_NAME = 'instagram_access_token';
const USER_ID_COOKIE_NAME     = 'instagram_user_id';
const USERNAME_COOKIE_NAME    = 'instagram_username';

const STATE_COOKIE_MAX_AGE_SECONDS    = 10 * 60;
const LONG_LIVED_TOKEN_MAX_AGE_SECONDS = 55 * 24 * 60 * 60; // long-lived tokens last ~60 days

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const getFrontendUrl = () => process.env.FRONTEND_URL ?? 'http://localhost:5173';

const getRequiredEnv = () => {
  const appId       = process.env.INSTAGRAM_APP_ID;
  const appSecret    = process.env.INSTAGRAM_SECRET;
  const redirectUri  = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    throw new Error('Instagram OAuth environment variables are not fully configured');
  }

  return { appId, appSecret, redirectUri };
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
  const { appId, redirectUri } = getRequiredEnv();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: OAUTH_SCOPE,
    state,
  });
  return `${INSTAGRAM_AUTH_URL}?${params.toString()}`;
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

export const buildSessionCookieHeaders = ({ accessToken, userId, username, maxAge }, req) => [
  buildCookie(ACCESS_TOKEN_COOKIE_NAME, accessToken,     req, { maxAge, httpOnly: true }),
  buildCookie(USER_ID_COOKIE_NAME,      userId,          req, { maxAge, httpOnly: true }),
  buildCookie(USERNAME_COOKIE_NAME,     username ?? '',  req, { maxAge, httpOnly: true }),
];

export const clearSessionCookieHeaders = req => [
  buildClearCookie(ACCESS_TOKEN_COOKIE_NAME, req),
  buildClearCookie(USER_ID_COOKIE_NAME,      req),
  buildClearCookie(USERNAME_COOKIE_NAME,     req),
];

export const getInstagramSessionFromRequest = req => {
  const cookies = parseCookies(req.headers.cookie);
  const accessToken = cookies[ACCESS_TOKEN_COOKIE_NAME];
  const userId       = cookies[USER_ID_COOKIE_NAME];

  if (!accessToken || !userId) return null;

  return {
    accessToken,
    userId,
    username: cookies[USERNAME_COOKIE_NAME] ?? '',
  };
};

export const exchangeCodeForToken = async code => {
  const { appId, appSecret, redirectUri } = getRequiredEnv();
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch(INSTAGRAM_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const data = await response.json();

  if (!response.ok || !data.access_token || !data.user_id) {
    console.error('Instagram token exchange failed:', data);
    throw new Error('Failed to exchange authorization code for Instagram access token');
  }

  return {
    shortLivedAccessToken: data.access_token,
    userId: String(data.user_id),
  };
};

export const exchangeForLongLivedToken = async shortLivedAccessToken => {
  const { appSecret } = getRequiredEnv();
  const params = new URLSearchParams({
    grant_type: 'ig_exchange_token',
    client_secret: appSecret,
    access_token: shortLivedAccessToken,
  });

  const response = await fetch(`${INSTAGRAM_LONG_LIVED_TOKEN_URL}?${params.toString()}`);
  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error('Instagram long-lived token exchange failed:', data);
    throw new Error('Failed to exchange Instagram access token for a long-lived token');
  }

  return {
    accessToken: data.access_token,
    expiresIn: Number.isFinite(data.expires_in) ? data.expires_in : LONG_LIVED_TOKEN_MAX_AGE_SECONDS,
  };
};

export const fetchInstagramUserInfo = async (accessToken, userId) => {
  const params = new URLSearchParams({
    fields: 'id,username,account_type',
    access_token: accessToken,
  });

  const response = await fetch(`${INSTAGRAM_GRAPH_BASE_URL}/${userId}?${params.toString()}`);
  const data = await response.json();

  if (!response.ok || !data.id) {
    console.error('Instagram profile fetch failed:', data);
    throw new Error('Failed to fetch Instagram user profile');
  }

  return {
    userId: String(data.id),
    username: data.username ?? '',
    accountType: data.account_type ?? '',
  };
};
