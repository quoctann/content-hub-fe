import { useState, useCallback, type FormEvent } from 'react';
import { Search, List, Grid3x3, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useViewPreferenceStore } from '@/stores/view-preference.store';
import { useSearchHistoryStore } from '@/stores/search-history.store';
import type { RecentSearch } from '@/types/content';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  recentSearches?: RecentSearch[];
  showRecentSearches?: boolean;
}

export function SearchBar({
  onSearch,
  placeholder = 'tìm ít chữ thôi...',
  initialValue = '',
  recentSearches = [],
  showRecentSearches = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useIsMobile();
  const viewMode = useViewPreferenceStore((state) => state.viewMode);
  const setViewMode = useViewPreferenceStore((state) => state.setViewMode);
  const clearSearches = useSearchHistoryStore((state) => state.clearSearches);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  }, [query, onSearch]);

  const handleRecentClick = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setIsFocused(false);
  }, [onSearch]);

  const toggleViewMode = useCallback(() => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  }, [viewMode, setViewMode]);

  const handleClearSearches = useCallback(() => {
    clearSearches();
    setIsFocused(false);
  }, [clearSearches]);

  const showDropdown = showRecentSearches && isFocused && recentSearches.length > 0 && !query;

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
        <Button type="submit">tìm</Button>
        {!isMobile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={toggleViewMode}
                  aria-label={viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}
                >
                  {viewMode === 'list' ? (
                    <Grid3x3 className="h-4 w-4" />
                  ) : (
                    <List className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {viewMode === 'list' ? 'Switch to grid view' : 'Switch to list view'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-border bg-popover p-2 shadow-lg">
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Gần đây</p>
          {recentSearches.map(search => (
            <button
              key={search.id}
              onClick={() => handleRecentClick(search.query)}
              className="w-full rounded-md px-2 py-2 text-left text-sm text-foreground hover:bg-accent"
            >
              {search.query}
            </button>
          ))}
          <button
            onClick={handleClearSearches}
            className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            xóa lịch sử tìm kiếm
          </button>
        </div>
      )}
    </div>
  );
}
