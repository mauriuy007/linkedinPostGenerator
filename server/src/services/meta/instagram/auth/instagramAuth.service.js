import crypto from 'crypto';
import { parseCookies, buildCookie, buildClearCookie } from '../../../../utils/cookies.js';

const GRAPH_API_VERSION = 'v25.0';
const FACEBOOK_AUTH_URL = `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth`;
const GRAPH_API_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// Instagram publishing via a linked Facebook Page — see
// https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login
const OAUTH_SCOPE = 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement';

const STATE_COOKIE_NAME       = 'instagram_oauth_state';
const ACCESS_TOKEN_COOKIE_NAME = 'instagram_access_token';
const USER_ID_COOKIE_NAME     = 'instagram_user_id';
const USERNAME_COOKIE_NAME    = 'instagram_username';

const STATE_COOKIE_MAX_AGE_SECONDS     = 10 * 60;
const LONG_LIVED_TOKEN_MAX_AGE_SECONDS = 55 * 24 * 60 * 60; // long-lived Page tokens last ~60 days

/* ─── Helpers ──────────────────────────────────────────────────────────── */

const getFrontendUrl = () => process.env.FRONTEND_URL ?? 'http://localhost:5173';

const getRequiredEnv = () => {
  const appId       = process.env.META_APP_ID;
  const appSecret   = process.env.META_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    throw new Error('Facebook/Instagram OAuth environment variables are not fully configured');
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
  return `${FACEBOOK_AUTH_URL}?${params.toString()}`;
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
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch(`${GRAPH_API_BASE_URL}/oauth/access_token?${params.toString()}`);
  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error('Facebook token exchange failed:', data);
    throw new Error('Failed to exchange authorization code for a Facebook access token');
  }

  return { accessToken: data.access_token };
};

export const exchangeForLongLivedToken = async shortLivedAccessToken => {
  const { appId, appSecret } = getRequiredEnv();
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedAccessToken,
  });

  const response = await fetch(`${GRAPH_API_BASE_URL}/oauth/access_token?${params.toString()}`);
  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error('Facebook long-lived token exchange failed:', data);
    throw new Error('Failed to exchange Facebook access token for a long-lived token');
  }

  return {
    accessToken: data.access_token,
    expiresIn: Number.isFinite(data.expires_in) ? data.expires_in : LONG_LIVED_TOKEN_MAX_AGE_SECONDS,
  };
};

// Walks the user's Facebook Pages to find one with a linked Instagram
// professional account, since Instagram permissions flow through the Page.
export const resolveInstagramBusinessAccount = async longLivedUserToken => {
  const pagesParams = new URLSearchParams({
    fields: 'id,name,access_token',
    access_token: longLivedUserToken,
  });

  const pagesResponse = await fetch(`${GRAPH_API_BASE_URL}/me/accounts?${pagesParams.toString()}`);
  const pagesData = await pagesResponse.json();

  if (!pagesResponse.ok) {
    console.error('Facebook Pages lookup failed:', pagesData);
    throw new Error('Failed to fetch your Facebook Pages');
  }

  const pages = pagesData.data ?? [];

  if (pages.length === 0) {
    throw new Error(
      'No Facebook Page found for this account. Instagram publishing requires a Facebook Page linked to your Instagram professional account.'
    );
  }

  for (const page of pages) {
    const igParams = new URLSearchParams({
      fields: 'instagram_business_account',
      access_token: page.access_token,
    });

    const igResponse = await fetch(`${GRAPH_API_BASE_URL}/${page.id}?${igParams.toString()}`);
    const igData = await igResponse.json();

    const igAccountId = igData?.instagram_business_account?.id;

    if (igResponse.ok && igAccountId) {
      const usernameParams = new URLSearchParams({
        fields: 'id,username',
        access_token: page.access_token,
      });

      const usernameResponse = await fetch(`${GRAPH_API_BASE_URL}/${igAccountId}?${usernameParams.toString()}`);
      const usernameData = await usernameResponse.json();

      if (!usernameResponse.ok || !usernameData.id) {
        console.error('Instagram profile fetch failed:', usernameData);
        throw new Error('Failed to fetch the linked Instagram professional account');
      }

      return {
        pageAccessToken: page.access_token,
        igUserId: String(usernameData.id),
        username: usernameData.username ?? '',
      };
    }
  }

  throw new Error('No Instagram professional account is linked to any of your Facebook Pages.');
};
