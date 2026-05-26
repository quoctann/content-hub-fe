/**
 * Auth Store (Zustand)
 *
 * Manages auth state for the admin dashboard.
 * Tokens are stored in HttpOnly cookies (set by the backend).
 * This store only tracks: csrfToken (for request headers), expiresAt, and isAuthenticated.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  csrfToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  setAuth: (csrfToken: string, expiresIn: number) => void;
  updateAccessToken: (csrfToken: string, expiresIn: number) => void;
  logout: () => void;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      csrfToken: null,
      expiresAt: null,
      isAuthenticated: false,

      setAuth: (csrfToken, expiresIn) =>
        set({
          csrfToken,
          expiresAt: Date.now() + expiresIn * 1000,
          isAuthenticated: true,
        }),

      updateAccessToken: (csrfToken, expiresIn) =>
        set({
          csrfToken,
          expiresAt: Date.now() + expiresIn * 1000,
        }),

      logout: () =>
        set({
          csrfToken: null,
          expiresAt: null,
          isAuthenticated: false,
        }),

      isTokenExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return true;
        return Date.now() >= expiresAt;
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        csrfToken: state.csrfToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
