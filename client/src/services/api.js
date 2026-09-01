const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('kiroku_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP Error ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (username, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  getMe: () => request('/auth/me'),

  // Entries
  getEntries: ({ type, status, search, sort } = {}) => {
    const params = new URLSearchParams();
    if (type && type !== 'All') params.append('type', type);
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);

    return request(`/entries?${params.toString()}`);
  },

  getEntry: (id) => request(`/entries/${id}`),

  addEntry: (entryData) =>
    request('/entries', {
      method: 'POST',
      body: JSON.stringify(entryData)
    }),

  updateEntry: (id, entryData) =>
    request(`/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData)
    }),

  updateProgress: (id, progress) =>
    request(`/entries/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress })
    }),

  deleteEntry: (id) =>
    request(`/entries/${id}`, {
      method: 'DELETE'
    }),

  clearAllEntries: () =>
    request('/entries', {
      method: 'DELETE'
    }),

  // Stats
  getStats: () => request('/stats'),

  // Jikan Search & Discover
  searchJikan: (type = 'anime', query = '', limit = 12) => {
    const params = new URLSearchParams({ type, q: query, limit });
    return request(`/jikan/search?${params.toString()}`);
  },

  getTopJikan: (type = 'anime', limit = 10) => {
    const params = new URLSearchParams({ type, limit });
    return request(`/jikan/top?${params.toString()}`);
  }
};
