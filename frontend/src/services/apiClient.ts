import axios from 'axios';

const apiClient = axios.create({
  baseURL:
    (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL ||
    'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const getCsrfToken = () => {
  const match = document.cookie.match(/(^|;) ?csrf_token=([^;]*)(;|$)/);
  return match ? match[2] : null;
};

apiClient.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) config.headers['x-csrf-token'] = csrf;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;