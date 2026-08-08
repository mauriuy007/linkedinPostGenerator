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
        reason: 'Error interno durante la autenticacion con LinkedIn',
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

export const instagramLogin = () => {
    
}
