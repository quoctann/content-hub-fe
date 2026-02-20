/**
 * Search History Store (Zustand)
 *
 * Manages recent searches with LIFO (Last In, First Out) behavior.
 * Persists to sessionStorage for session-based history.
 *
 * Usage:
 *   import { useSearchHistoryStore } from '@/stores/search-history.store';
 *
 *   // In component
 *   const { recentSearches, addSearch, clearSearches } = useSearchHistoryStore();
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RecentSearch } from "@/types/content";

const MAX_RECENT_SEARCHES = 3;

interface SearchHistoryState {
  /** LIFO list of recent searches (newest first) */
  recentSearches: RecentSearch[];

  /** Add a new search to history (LIFO - adds to front, removes oldest if > 10) */
  addSearch: (query: string) => void;

  /** Remove a specific search by ID */
  removeSearch: (id: string) => void;

  /** Clear all recent searches */
  clearSearches: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      recentSearches: [],

      addSearch: (query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;

        const { recentSearches } = get();

        // Remove duplicate if exists (LIFO: move to front)
        const filtered = recentSearches.filter((s) => s.query !== trimmedQuery);

        // Create new search entry
        const newSearch: RecentSearch = {
          id: crypto.randomUUID(),
          query: trimmedQuery,
          timestamp: new Date(),
        };

        // Add to front (LIFO), keep max 10 items
        const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

        set({ recentSearches: updated });
      },

      removeSearch: (id: string) => {
        set((state) => ({
          recentSearches: state.recentSearches.filter((s) => s.id !== id),
        }));
      },

      clearSearches: () => {
        set({ recentSearches: [] });
      },
    }),
    {
      name: "content-hub-search-history",
      storage: createJSONStorage(() => sessionStorage),
      // Rehydrate dates from JSON
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.recentSearches = state.recentSearches.map((s) => ({
            ...s,
            timestamp: new Date(s.timestamp),
          }));
        }
      },
    },
  ),
);
