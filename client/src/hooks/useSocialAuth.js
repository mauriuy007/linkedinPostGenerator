import { useEffect, useState } from 'react';
import { fetchProfile } from '../api/auth.js';

const CONFIG = {
  linkedin: {
    statusParam: 'linkedin',
    idParam: 'linkedinId',
    loginPath: '/api/auth/linkedin',
    mePath: '/api/auth/linkedin/me',
    label: 'LinkedIn',
    defaultName: 'LinkedIn User',
    parseProfile: (data) => ({ name: data?.name ?? 'LinkedIn User', picture: data?.picture ?? '' }),
  },
  instagram: {
    statusParam: 'instagram',
    idParam: 'instagramId',
    loginPath: '/api/auth/instagram',
    mePath: '/api/auth/instagram/me',
    label: 'Instagram',
    defaultName: 'Instagram User',
    parseProfile: (data) => ({ name: data?.username ?? 'Instagram User', picture: '' }),
  },
};

// Drives one platform's OAuth session: parses the redirect Auto Post's own
// backend sends the browser back to (?linkedin=ok|error / ?instagram=ok|error),
// syncs an existing session on mount, and exposes a login() redirect.
export default function useSocialAuth(platform, { apiBaseUrl, onConnected, onError }) {
  const config = CONFIG[platform];
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const status = currentUrl.searchParams.get(config.statusParam);

    console.log(`[auth:${platform}] redirect effect ran, status param =`, status, 'full URL:', currentUrl.href);

    if (!status) {
      return;
    }

    const reason = currentUrl.searchParams.get('reason');
    const name = currentUrl.searchParams.get('name');
    const picture = currentUrl.searchParams.get('picture');

    if (status === 'ok') {
      const nextProfile = { name: name ?? config.defaultName, picture: picture ?? '' };
      setProfile(nextProfile);
      console.log(`[auth:${platform}] calling onConnected with source=redirect`);
      onConnected?.(nextProfile, { source: 'redirect', name });
    }

    if (status === 'error') {
      onError?.(reason ?? `We couldn't complete ${config.label} login.`);
    }

    currentUrl.searchParams.delete(config.statusParam);
    currentUrl.searchParams.delete('reason');
    currentUrl.searchParams.delete('name');
    currentUrl.searchParams.delete('picture');
    currentUrl.searchParams.delete(config.idParam);
    window.history.replaceState({}, '', currentUrl);
    // Runs once on mount to consume the OAuth redirect, if any.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log(`[auth:${platform}] session sync effect started`);

    const sync = async () => {
      try {
        const data = await fetchProfile(apiBaseUrl, config.mePath);

        console.log(`[auth:${platform}] session sync response:`, data);

        if (!data) {
          return;
        }

        const nextProfile = config.parseProfile(data);
        setProfile(nextProfile);
        console.log(`[auth:${platform}] calling onConnected with source=session`);
        onConnected?.(nextProfile, { source: 'session' });
      } catch (error) {
        console.error(`Couldn't retrieve ${config.label} profile:`, error);
      }
    };

    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl]);

  const login = () => {
    window.location.assign(`${apiBaseUrl}${config.loginPath}`);
  };

  return { profile, login, label: config.label };
}
