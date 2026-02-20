/**
 * Search Hook
 *
 * Manages search state, filtering, and cursor-based pagination.
 * Uses Zustand store for recent search history.
 *
 * Pagination strategy:
 * The backend uses offset-based pagination where the cursor is the next
 * offset value provided in the pagination metadata. When loading more results,
 * we pass the next_cursor from the previous response.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { ContentItem, SearchFilter } from "@/types/content";
import { searchContent, parseSearchQuery } from "@/services/content.service";
import { useSearchHistoryStore } from "@/stores/search-history.store";

interface UseSearchResult {
  items: ContentItem[];
  isLoading: boolean;
  hasMore: boolean;
  total: number;
  search: (query: string) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function useSearch(initialQuery?: string): UseSearchResult {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [currentFilter, setCurrentFilter] = useState<SearchFilter>({});
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const addSearch = useSearchHistoryStore((state) => state.addSearch);
  const initialQueryRef = useRef(initialQuery);

  // Execute initial query if provided
  // Intentionally not including 'search' in deps to avoid infinite loop
  // since 'search' depends on 'addSearch' which changes frequently
  useEffect(() => {
    if (initialQueryRef.current) {
      search(initialQueryRef.current);
      initialQueryRef.current = undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const search = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setPage(1);

      const filter = parseSearchQuery(query);
      setCurrentFilter(filter);

      try {
        const response = await searchContent(filter, 1);
        setItems(response.items);
        setHasMore(response.hasMore);
        setTotal(response.total);
        setNextCursor(response.nextCursor || undefined);

        // Add to recent searches if query is not empty
        if (query.trim()) {
          addSearch(query);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setItems([]);
        setHasMore(false);
        setTotal(0);
        setNextCursor(undefined);
      } finally {
        setIsLoading(false);
      }
    },
    [addSearch],
  );

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !nextCursor) return;

    setIsLoading(true);
    const nextPage = page + 1;

    try {
      const response = await searchContent(
        currentFilter,
        nextPage,
        10,
        nextCursor,
      );
      setItems((prev) => [...prev, ...response.items]);
      setHasMore(response.hasMore);
      setPage(nextPage);
      setNextCursor(response.nextCursor || undefined);
    } catch (error) {
      console.error("Load more failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, nextCursor, page, currentFilter]);

  const reset = useCallback(() => {
    setItems([]);
    setIsLoading(false);
    setHasMore(false);
    setTotal(0);
    setPage(1);
    setCurrentFilter({});
    setNextCursor(undefined);
  }, []);

  return {
    items,
    isLoading,
    hasMore,
    total,
    search,
    loadMore,
    reset,
  };
}
