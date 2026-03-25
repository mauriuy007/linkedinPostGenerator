import crypto from 'crypto';

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';
const STATE_COOKIE_NAME = 'linkedin_oauth_state';
const STATE_COOKIE_MAX_AGE_SECONDS = 10 * 60;

const getFrontendUrl = () => {
  return process.env.FRONTEND_URL ?? 'http://localhost:5173';
};

const buildFrontendRedirectUrl = (pathname = '/', params = {}) => {
  const url = new URL(pathname, getFrontendUrl());

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

const getRequiredEnv = () => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('LinkedIn OAuth environment variables are not fully configured');
  }

  return { clientId, clientSecret, redirectUri };
};

const parseCookies = (cookieHeader = '') => {
  return cookieHeader
    .split(';')
    .map(cookie => cookie.trim())
    .filter(Boolean)
    .reduce((acc, cookie) => {
      const separatorIndex = cookie.indexOf('=');

      if (separatorIndex === -1) {
        return acc;
      }

      const key = cookie.slice(0, separatorIndex);
      const value = cookie.slice(separatorIndex + 1);
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
};

const buildStateCookie = (state, req) => {
  const isSecure =
    req.secure || req.headers['x-forwarded-proto'] === 'https';

  const cookieParts = [
    `${STATE_COOKIE_NAME}=${encodeURIComponent(state)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${STATE_COOKIE_MAX_AGE_SECONDS}`
  ];

  if (isSecure) {
    cookieParts.push('Secure');
  }

  return cookieParts.join('; ');
};

const clearStateCookie = req => {
  const isSecure =
    req.secure || req.headers['x-forwarded-proto'] === 'https';

  const cookieParts = [
    `${STATE_COOKIE_NAME}=`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0'
  ];

  if (isSecure) {
    cookieParts.push('Secure');
  }

  return cookieParts.join('; ');
};

export const linkedinLogin = async (req, res) => {
  try {
    const { clientId, redirectUri } = getRequiredEnv();
    const state = crypto.randomUUID();
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'openid profile email w_member_social',
      state
    });

    res.setHeader('Set-Cookie', buildStateCookie(state, req));
    return res.redirect(`${LINKEDIN_AUTH_URL}?${params.toString()}`);
  } catch (error) {
    console.error('LinkedIn login setup failed:', error);
    return res.status(500).json({ message: 'LinkedIn OAuth is not configured correctly' });
  }
};

export const linkedinCallback = async (req, res) => {
  const { code, state, error, error_description: errorDescription } = req.query;
  const cookies = parseCookies(req.headers.cookie);
  const storedState = cookies[STATE_COOKIE_NAME];

  res.setHeader('Set-Cookie', clearStateCookie(req));

  if (error) {
    return res.redirect(
      buildFrontendRedirectUrl('/', {
        linkedin: 'error',
        reason: errorDescription ?? error
      })
    );
  }

  if (!code) {
    return res.redirect(
      buildFrontendRedirectUrl('/', {
        linkedin: 'error',
        reason: 'No se recibio el codigo de autorizacion de LinkedIn'
      })
    );
  }

  if (!state || !storedState || state !== storedState) {
    return res.redirect(
      buildFrontendRedirectUrl('/', {
        linkedin: 'error',
        reason: 'Estado OAuth invalido'
      })
    );
  }

  try {
    const { clientId, clientSecret, redirectUri } = getRequiredEnv();
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    });

    const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.redirect(
        buildFrontendRedirectUrl('/', {
          linkedin: 'error',
          reason: 'No se pudo validar el codigo con LinkedIn'
        })
      );
    }

    const accessToken = tokenData.access_token;
    const userResponse = await fetch(LINKEDIN_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const userData = await userResponse.json();

    if (!userResponse.ok || !userData.sub) {
      return res.redirect(
        buildFrontendRedirectUrl('/', {
          linkedin: 'error',
          reason: 'No se pudo obtener el perfil de LinkedIn'
        })
      );
    }

    const linkedinId = userData.sub;
    const displayName =
      userData.name ??
      [userData.given_name, userData.family_name].filter(Boolean).join(' ') ??
      '';

    console.log('LinkedIn login successful for:', linkedinId);

    return res.redirect(
      buildFrontendRedirectUrl('/', {
        linkedin: 'ok',
        linkedinId,
        name: displayName
      })
    );
  } catch (error) {
    console.error('Error during LinkedIn auth:', error);
    return res.redirect(
      buildFrontendRedirectUrl('/', {
        linkedin: 'error',
        reason: 'Error interno durante la autenticacion con LinkedIn'
      })
    );
  }
};
