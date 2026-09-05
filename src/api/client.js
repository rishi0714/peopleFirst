const BASE_URL = 'http://localhost:8081';

let onUnauthorized = () => {};

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('peoplefirst_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { ...options, headers };

  try {
    const response = await fetch(url, config);

    if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
      onUnauthorized();
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data && data.message ? data.message : `HTTP error ${response.status}`;
      const err = new Error(message);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}
