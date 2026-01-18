/**
 * Content types for the Content Hub application
 */

export type ContentType = "text" | "image";

export interface Tag {
  id: string;
  name: string;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  content: string; // For text: the actual text content. For image: the image URL
  tags: Tag[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilter {
  keyword?: string;
  tags?: string[];
  categories?: string[];
  type?: ContentType;
}

export interface SearchRequest {
  keyword: string;
  filter: SearchFilter;
}

export interface SearchResponse {
  items: ContentItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: Date;
}
