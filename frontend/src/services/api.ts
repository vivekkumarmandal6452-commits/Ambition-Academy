import axios from 'axios';
import { supabase } from '../lib/supabase';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const isBrowser = typeof window !== 'undefined';
  const isProductionBrowser = isBrowser && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');

  if (isProductionBrowser) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    return 'https://ambition-academy.onrender.com';
  }

  return envUrl || 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
});

// Attach Supabase or Local JWT to every request
api.interceptors.request.use(async (config) => {
  let token: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token || null;
  } catch {
    // Ignore Supabase error if not configured
  }

  if (!token) {
    token = localStorage.getItem('ambition_token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('ambition_token');
      try { await supabase.auth.signOut(); } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
