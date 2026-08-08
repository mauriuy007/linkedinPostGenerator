export const parseCookies = (cookieHeader = '') =>
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

const isSecureRequest = req => req.secure || req.headers['x-forwarded-proto'] === 'https';

// Client and server are served from different origins, so cross-site fetches
// need SameSite=None (which browsers only honor alongside Secure). Plain HTTP
// (local dev) can't set Secure, so it falls back to Lax there.
const defaultSameSite = isSecure => (isSecure ? 'None' : 'Lax');

export const buildCookie = (name, value, req, options = {}) => {
  const isSecure = isSecureRequest(req);
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `SameSite=${options.sameSite ?? defaultSameSite(isSecure)}`,
    `Max-Age=${options.maxAge ?? 60 * 60}`,
  ];
  if (options.httpOnly ?? true) parts.push('HttpOnly');
  if (isSecure) parts.push('Secure');
  return parts.join('; ');
};

export const buildClearCookie = (name, req) => {
  const isSecure = isSecureRequest(req);
  const parts = [`${name}=`, 'Path=/', `SameSite=${defaultSameSite(isSecure)}`, 'Max-Age=0', 'HttpOnly'];
  if (isSecure) parts.push('Secure');
  return parts.join('; ');
};
