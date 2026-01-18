import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/search/SearchBar';
import { ContentList } from '@/components/content/ContentList';
import { useSearch } from '@/hooks/use-search';
import { useSearchHistoryStore } from '@/stores/search-history.store';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type');
  
  const [currentQuery, setCurrentQuery] = useState(() => {
    if (initialType) {
      return `@${initialType} ${initialQuery}`.trim();
    }
    return initialQuery;
  });

  const { items, isLoading, hasMore, total, search, loadMore } = useSearch();
  const recentSearches = useSearchHistoryStore((state) => state.recentSearches);

  // Perform initial search on mount or when query changes
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    const typeFromUrl = searchParams.get('type');
    
    let searchQuery = queryFromUrl;
    if (typeFromUrl) {
      searchQuery = `@${typeFromUrl} ${queryFromUrl}`.trim();
    }

    setCurrentQuery(searchQuery);
    search(searchQuery);
  }, [searchParams, search]);

  const handleSearch = (query: string) => {
    setCurrentQuery(query);
    
    // Update URL params
    if (query.trim()) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
    
    search(query);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            initialValue={currentQuery}
            recentSearches={recentSearches}
            showRecentSearches={true}
          />
          {total > 0 && !isLoading && (
            <p className="mt-4 text-sm text-muted-foreground">
              Found {total} result{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <ContentList
          items={items}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </Layout>
  );
}
