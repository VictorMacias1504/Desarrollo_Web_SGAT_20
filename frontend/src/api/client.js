import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Adjuntar token JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sgat_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirigir al login si el token expira
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sgat_token');
      localStorage.removeItem('sgat_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
