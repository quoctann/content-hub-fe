import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/search/SearchBar';
import { ContentList } from '@/components/content/ContentList';
import { useSearch } from '@/hooks/use-search';
import { useSearchHistoryStore } from '@/stores/search-history.store';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentQuery = useMemo(() => {
    const queryFromUrl = searchParams.get('q') || '';
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl) {
      return `@${typeFromUrl} ${queryFromUrl}`.trim();
    }
    return queryFromUrl;
  }, [searchParams]);

  const { items, isLoading, hasMore, total, search, loadMore } = useSearch();
  const recentSearches = useSearchHistoryStore((state) => state.recentSearches);

  // Perform initial search on mount or when query changes
  useEffect(() => {
    search(currentQuery);
  }, [searchParams, search, currentQuery]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
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
