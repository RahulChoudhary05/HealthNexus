const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const GET_CACHE = new Map();
const DEFAULT_TTL_MS = 60 * 1000;

const withQuery = (endpoint, params = null) => {
  if (!params || typeof params !== 'object') return endpoint;

  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, String(value));
  });

  const qs = query.toString();
  return qs ? `${endpoint}?${qs}` : endpoint;
};

async function request(endpoint, method = 'GET', body = null, options = {}) {
  const useCache = method === 'GET' && options.useCache !== false;
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const cacheKey = `${method}:${endpoint}`;

  if (useCache) {
    const cached = GET_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.ts < ttlMs) {
      return { data: cached.data, status: 200, fromCache: true };
    }
  }

  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('access_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const config = { method, headers };
  if (body !== null) config.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch {
    throw new Error('Network error — is the backend server running?');
  }

  if (response.status === 204) return { data: null, status: 204 };

  let data = null;
  try { data = await response.json(); } catch { data = null; }

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  if (!response.ok) {
    const err = new Error(data?.message || data?.detail || `Request failed (${response.status})`);
    err.response = { data, status: response.status };
    throw err;
  }

  if (method === 'GET' && response.ok) {
    GET_CACHE.set(cacheKey, { data, ts: Date.now() });
  }

  if (method !== 'GET' && response.ok) {
    GET_CACHE.clear();
  }

  return { data, status: response.status };
}

export const api = {
  get:    (url, params, options) => request(withQuery(url, params), 'GET', null, options),
  post:   (url, body) => request(url, 'POST',  body),
  put:    (url, body) => request(url, 'PUT',   body),
  patch:  (url, body) => request(url, 'PATCH', body),
  delete: (url)       => request(url, 'DELETE'),
};

export const setAuthToken = (token) => {
  if (token) localStorage.setItem('access_token', token);
  else       localStorage.removeItem('access_token');
};