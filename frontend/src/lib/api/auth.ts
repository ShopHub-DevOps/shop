import { api } from '../axios';
import Cookies from 'js-cookie';

export interface LoginResponse {
  accessToken: string;
}

export const login = async (credentials: Record<string, string>) => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  
  if (response.data?.accessToken) {
    Cookies.set('token', response.data.accessToken, { expires: 1 });
  }
  
  return response.data;
};

export const logout = () => {
  Cookies.remove('token');
};