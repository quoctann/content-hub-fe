/**
 * Auth Store (Zustand)
 *
 * Manages JWT token state for the admin dashboard.
 * Persists tokens to localStorage so the session survives page refreshes.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  /** True if a valid token is present */
  isAuthenticated: boolean;
  /** Store JWT tokens after a successful login */
  setTokens: (token: string, refreshToken: string, expiresIn: number) => void;
  /** Clear all auth state (logout) */
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      expiresIn: null,
      isAuthenticated: false,

      setTokens: (token, refreshToken, expiresIn) =>
        set({ token, refreshToken, expiresIn, isAuthenticated: true }),

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          expiresIn: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'admin-auth', // localStorage key
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        expiresIn: state.expiresIn,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
