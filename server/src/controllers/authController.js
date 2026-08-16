import {
  generateOAuthState,
  buildOAuthLoginUrl,
  buildStateCookieHeader,
  clearStateCookieHeader,
  buildSessionCookieHeaders,
  clearSessionCookieHeaders,
  getLinkedinSessionFromRequest,
  getStoredOAuthState,
  exchangeCodeForToken,
  fetchLinkedinUserInfo,
  buildFrontendRedirectUrl,
} from '../services/linkedin/auth/linkedinAuth.service.js';
import {
  generateOAuthState as generateInstagramOAuthState,
  buildOAuthLoginUrl as buildInstagramOAuthLoginUrl,
  buildStateCookieHeader as buildInstagramStateCookieHeader,
  clearStateCookieHeader as clearInstagramStateCookieHeader,
  buildSessionCookieHeaders as buildInstagramSessionCookieHeaders,
  clearSessionCookieHeaders as clearInstagramSessionCookieHeaders,
  getInstagramSessionFromRequest,
  getStoredOAuthState as getStoredInstagramOAuthState,
  exchangeCodeForToken as exchangeInstagramCodeForToken,
  exchangeForLongLivedToken as exchangeForLongLivedInstagramToken,
  resolveInstagramBusinessAccount,
  buildFrontendRedirectUrl as buildInstagramFrontendRedirectUrl,
} from '../services/meta/instagram/auth/instagramAuth.service.js';

export const linkedinLogin = async (req, res) => {
  try {
    const state    = generateOAuthState();
    const loginUrl = buildOAuthLoginUrl(state);

    res.setHeader('Set-Cookie', buildStateCookieHeader(state, req));
    return res.redirect(loginUrl);
  } catch (error) {
    console.error('LinkedIn login setup failed:', error);
    return res.status(500).json({ message: 'LinkedIn OAuth is not configured correctly' });
  }
};

export const linkedinCallback = async (req, res) => {
  const { code, state, error, error_description: errorDescription } = req.query;
  const storedState = getStoredOAuthState(req);

  res.setHeader('Set-Cookie', [clearStateCookieHeader(req), ...clearSessionCookieHeaders(req)]);

  if (error) {
    return res.redirect(
      buildFrontendRedirectUrl('/', { linkedin: 'error', reason: errorDescription ?? error })
    );
  }

  if (!code) {
    return res.redirect(
      buildFrontendRedirectUrl('/', {
        linkedin: 'error',
        reason: 'No se recibio el codigo de autorizacion de LinkedIn',
      })
    );
  }

  if (!state || !storedState || state !== storedState) {
    return res.redirect(
      buildFrontendRedirectUrl('/', { linkedin: 'error', reason: 'Estado OAuth invalido' })
    );
  }

  try {
    const { accessToken, expiresIn } = await exchangeCodeForToken(code);
    const { linkedinId, memberUrn, displayName, picture } = await fetchLinkedinUserInfo(accessToken);

    console.log('LinkedIn login successful for:', linkedinId);

    res.setHeader('Set-Cookie', [
      clearStateCookieHeader(req),
      ...buildSessionCookieHeaders(
        { accessToken, memberUrn, displayName, picture, linkedinId, maxAge: expiresIn },
        req
      ),
    ]);

    return res.redirect(
      buildFrontendRedirectUrl('/', { linkedin: 'ok', linkedinId, name: displayName, picture })
    );
  } catch (err) {
    console.error('Error during LinkedIn auth:', err);
    return res.redirect(
      buildFrontendRedirectUrl('/', {
        linkedin: 'error',
        reason: err.message || 'Error interno durante la autenticacion con LinkedIn',
      })
    );
  }
};

export const linkedinMe = (req, res) => {
  const session = getLinkedinSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({ error: 'No active LinkedIn session found' });
  }

  return res.status(200).json({
    linkedinId: session.linkedinId,
    memberUrn:  session.memberUrn,
    name:       session.displayName,
    picture:    session.picture,
  });
};

export const instagramLogin = async (req, res) => {
  try {
    const state    = generateInstagramOAuthState();
    const loginUrl = buildInstagramOAuthLoginUrl(state);

    res.setHeader('Set-Cookie', buildInstagramStateCookieHeader(state, req));
    return res.redirect(loginUrl);
  } catch (error) {
    console.error('Instagram login setup failed:', error);
    return res.status(500).json({ message: 'Instagram OAuth is not configured correctly' });
  }
};

export const instagramCallback = async (req, res) => {
  const { code, state, error, error_description: errorDescription } = req.query;
  const storedState = getStoredInstagramOAuthState(req);

  res.setHeader('Set-Cookie', [
    clearInstagramStateCookieHeader(req),
    ...clearInstagramSessionCookieHeaders(req),
  ]);

  if (error) {
    return res.redirect(
      buildInstagramFrontendRedirectUrl('/', { instagram: 'error', reason: errorDescription ?? error })
    );
  }

  if (!code) {
    return res.redirect(
      buildInstagramFrontendRedirectUrl('/', {
        instagram: 'error',
        reason: 'No se recibio el codigo de autorizacion de Instagram',
      })
    );
  }

  if (!state || !storedState || state !== storedState) {
    return res.redirect(
      buildInstagramFrontendRedirectUrl('/', { instagram: 'error', reason: 'Estado OAuth invalido' })
    );
  }

  try {
    const { accessToken: shortLivedToken } = await exchangeInstagramCodeForToken(code);
    const { accessToken: longLivedUserToken, expiresIn } = await exchangeForLongLivedInstagramToken(shortLivedToken);
    const { pageAccessToken, igUserId, username } = await resolveInstagramBusinessAccount(longLivedUserToken);

    console.log('Instagram login successful for:', igUserId);

    res.setHeader('Set-Cookie', [
      clearInstagramStateCookieHeader(req),
      ...buildInstagramSessionCookieHeaders(
        { accessToken: pageAccessToken, userId: igUserId, username, maxAge: expiresIn },
        req
      ),
    ]);

    return res.redirect(
      buildInstagramFrontendRedirectUrl('/', { instagram: 'ok', instagramId: igUserId, name: username })
    );
  } catch (err) {
    console.error('Error during Instagram auth:', err);
    return res.redirect(
      buildInstagramFrontendRedirectUrl('/', {
        instagram: 'error',
        reason: err.message || 'Error interno durante la autenticacion con Instagram',
      })
    );
  }
};

export const instagramMe = (req, res) => {
  const session = getInstagramSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({ error: 'No active Instagram session found' });
  }

  return res.status(200).json({
    instagramId: session.userId,
    username:    session.username,
  });
};
