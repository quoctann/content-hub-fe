import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SearchBar } from '@/components/search/SearchBar';
import { useSearchHistoryStore } from '@/stores/search-history.store';

const animatedTexts = [
  'muối chấm me',
  'break the ice',
  'hề mạng',
  'me me hay mim',
  'bún đậu chấm sữa ông thọ',
  'đùa không vui, tôi đã căng',
];

export default function Index() {
  const navigate = useNavigate();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  const recentSearches = useSearchHistoryStore((state) => state.recentSearches);

  // Typing animation effect
  useEffect(() => {
    const targetText = animatedTexts[currentTextIndex];

    if (isTyping) {
      if (displayText.length < targetText.length) {
        const timeout = setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length + 1));
        }, 50);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setIsTyping(false), 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setCurrentTextIndex((prev) => (prev + 1) % animatedTexts.length);
          setIsTyping(true);
        }, 100);
        return () => clearTimeout(timeout);
      }
    }
  }, [displayText, isTyping, currentTextIndex]);

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/search');
    }
  }, [navigate]);

  return (
    <Layout>
      <section className="container flex flex-col items-center justify-center py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            meme <span className="text-muted-foreground">(n)</span> <span className="italic">/miːm/</span>
          </h1>
          <p className="mt-4 h-8 text-xl text-muted-foreground md:text-2xl">
            {displayText}
            <span className="ml-0.5 inline-block w-0.5 h-6 bg-foreground animate-pulse" />
          </p>

          <div className="mt-10 w-full">
            <SearchBar
              onSearch={handleSearch}
              recentSearches={recentSearches}
              showRecentSearches={true}
            />
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-medium">mẹo:</p>
            <ul className="mt-2 space-y-1">
              <li><code className="rounded bg-muted px-1.5 py-0.5">@text</code> hoặc <code className="rounded bg-muted px-1.5 py-0.5">@image</code> - lọc content ảnh hoặc văn bản</li>
              <li>xài dấu phẩy <code className="rounded bg-muted px-1.5 py-0.5">,</code> để tìm chi tiết hơn</li>
              <li>dí dụ: <code className="rounded bg-muted px-1.5 py-0.5">gai, dep @image</code></li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
}
