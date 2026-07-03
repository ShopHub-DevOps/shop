'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

interface AuthInitializerProps {
  token: string | null;
  role: string | null;
}

export function AuthInitializer({ token, role }: AuthInitializerProps) {
  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (token) {
      const state = useAuthStore.getState();
      // If store token doesn't match the cookie token, or if we just want to force sync:
      if (state.token !== token || state.role !== role) {
        state.login(token, role || undefined);
      }
    } else {
      const state = useAuthStore.getState();
      if (state.isLoggedIn) {
        state.logout();
      }
    }
  }, [token, role]);

  return null;
}
