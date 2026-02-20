import { useState, useCallback, memo } from 'react';
import { Copy, Download, ChevronDown, ChevronUp, Check, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ContentItem } from '@/types/content';
import { copyToClipboard, downloadContent } from '@/services/content.service';
import { toast } from 'sonner';

interface ContentCardProps {
  item: ContentItem;
}

export const ContentCard = memo(function ContentCard({ item }: ContentCardProps) {
  // Default expanded for images, collapsed for text items
  const [isExpanded, setIsExpanded] = useState(item.type === 'image');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(item);
    if (success) {
      setIsCopied(true);
      toast.success('đã sao chép vào bộ nhớ tạm');
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      toast.error('lỗi cmnr!');
    }
  }, [item]);

  const handleDownload = useCallback(() => {
    downloadContent(item);
    toast.success('đã tải về');
  }, [item]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);


  const TypeIcon = item.type === 'text' ? FileText : Image;

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
            <TypeIcon className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground leading-tight">{item.title}</h3>
              {item.rank && item.rank > 0 && (
                <Badge variant="secondary" className="text-xs">
                  độ liên quan: {(item.rank * 100).toFixed(2)}%
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleExpand} className="shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>

      <CardContent>
        {item.type === 'text' ? (
          <p className={`text-sm text-muted-foreground whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-2'}`}>
            {item.content}
          </p>
        ) : (
          <div className={`overflow-auto rounded-lg bg-muted ${isExpanded ? 'max-h-screen' : 'max-h-48'}`}>
            {item.content ? (
              <img
                src={item.content}
                alt={item.title}
                className="w-full h-auto object-contain transition-all"
                loading="lazy"
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-muted">
                <Image className="h-10 w-10 text-muted-foreground/50" />
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            tải xuống
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {isCopied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                copied!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                copy
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
