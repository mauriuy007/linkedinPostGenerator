import crypto from 'crypto';

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';
const STATE_COOKIE_NAME = 'linkedin_oauth_state';
const STATE_COOKIE_MAX_AGE_SECONDS = 10 * 60;

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
    return res.status(400).json({
      message: 'LinkedIn authorization failed',
      error,
      errorDescription
    });
  }

  if (!code) {
    return res.status(400).json({ message: 'No authorization code received from LinkedIn' });
  }

  if (!state || !storedState || state !== storedState) {
    return res.status(400).json({ message: 'Invalid OAuth state' });
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
      return res.status(502).json({
        message: 'Failed to exchange authorization code with LinkedIn',
        details: tokenData
      });
    }

    const accessToken = tokenData.access_token;
    const userResponse = await fetch(LINKEDIN_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const userData = await userResponse.json();

    if (!userResponse.ok || !userData.sub) {
      return res.status(502).json({
        message: 'Failed to fetch LinkedIn user profile',
        details: userData
      });
    }

    const linkedinId = userData.sub;
    const personUrn = `urn:li:person:${linkedinId}`;

    return res.status(200).json({
      message: 'LinkedIn login successful',
      linkedin: {
        accessToken,
        linkedinId,
        personUrn,
        profile: userData
      }
    });
  } catch (error) {
    console.error('Error during LinkedIn auth:', error);
    return res.status(500).json({ message: 'Error during LinkedIn auth' });
  }
};
