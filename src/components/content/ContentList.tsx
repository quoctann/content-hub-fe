import { useCallback, useEffect, useRef } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentCard } from './ContentCard';
import type { ContentItem } from '@/types/content';

interface ContentListProps {
  items: ContentItem[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function ContentList({ items, isLoading, hasMore, onLoadMore }: ContentListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Lazy load more when scrolling near the bottom
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= documentHeight - 200) {
        onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore, onLoadMore]);

  if (items.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">No content found</p>
        <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search query</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {items.map(item => (
        <ContentCard key={item.id} item={item} />
      ))}

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={onLoadMore}>
            Load More
          </Button>
        </div>
      )}

      {items.length > 3 && (
        <div className="fixed bottom-6 right-6">
          <Button
            variant="secondary"
            size="icon"
            onClick={scrollToTop}
            className="h-10 w-10 rounded-full shadow-lg"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
