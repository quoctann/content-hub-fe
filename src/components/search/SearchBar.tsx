import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  placeholder = 'Search content... (use @text or @image for type)',
  initialValue = '',
  recentSearches = [],
  showRecentSearches = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  }, [query, onSearch]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  }, [query, onSearch]);

  const handleRecentClick = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setIsFocused(false);
  }, [onSearch]);

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
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-border bg-popover p-2 shadow-lg">
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Recent Searches</p>
          {recentSearches.map(search => (
            <button
              key={search.id}
              onClick={() => handleRecentClick(search.query)}
              className="w-full rounded-md px-2 py-2 text-left text-sm text-foreground hover:bg-accent"
            >
              {search.query}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
