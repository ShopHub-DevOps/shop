import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  email: string | null;
  role: string | null;
  isLoggedIn: boolean;
  login: (token: string, explicitRole?: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      email: null,
      role: null,
      isLoggedIn: false,

      login: (token: string, explicitRole?: string) => {
        const decoded = jwtDecode<JwtPayload>(token);
        Cookies.set('token', token, { expires: 7 });
        set({
          token,
          email: decoded.email,
          role: explicitRole || decoded.role,
          isLoggedIn: true,
        });
      },

      logout: () => {
        Cookies.remove('token');
        set({
          token: null,
          email: null,
          role: null,
          isLoggedIn: false,
        });
      },

      isAdmin: () => get().role === 'admin',
    }),
    {
      name: 'shop-auth-storage',
    }
  )
);