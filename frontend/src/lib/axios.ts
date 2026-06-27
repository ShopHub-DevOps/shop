import axios from 'axios';
import Cookies from 'js-cookie';

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // relative "/api"

    return '/api';
  }

  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export const api = axios.create({
  // Replace with backend port
  //baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', 
  baseURL: getBaseUrl(), 
});

// Interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token'); // Reading token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);