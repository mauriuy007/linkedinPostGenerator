export const fetchProfile = async (apiBaseUrl, path) => {
  const response = await fetch(`${apiBaseUrl}${path}`, { credentials: 'include' });

  if (!response.ok) {
    return null;
  }

  return response.json();
};
