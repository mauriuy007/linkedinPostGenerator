export const fetchProfile = async (apiBaseUrl, path) => {
  const response = await fetch(`${apiBaseUrl}${path}`, { credentials: 'include' });

  if (!response.ok) {
    return null;
  }

  return response.json();
};

export const logout = async (apiBaseUrl, path) => {
  await fetch(`${apiBaseUrl}${path}`, { method: 'POST', credentials: 'include' });
};
