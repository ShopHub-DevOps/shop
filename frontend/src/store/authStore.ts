import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

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
  login: (token: string) => void;
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

      login: (token: string) => {
        const decoded = jwtDecode<JwtPayload>(token);
        set({
          token,
          email: decoded.email,
          role: decoded.role,
          isLoggedIn: true,
        });
      },

      logout: () => {
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