/**
 * Content types for the Content Hub application
 */

// =============================================================================
// Frontend types (used by UI components)
// =============================================================================

export type ContentType = 'text' | 'image' | 'video';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  category: string;
  rank?: number; // Search relevance rank (optional, only present in search results)
  tags?: { id: string; name: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilter {
  keyword?: string;
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
  nextCursor?: string; // Next cursor for pagination (undefined if no more results)
}

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: Date;
}

// =============================================================================
// Backend API types (matching Go domain structs exactly)
// These mirror the JSON shape returned by the Content Hub backend.
// =============================================================================

/** Matches `domain.PaginationMeta` from the backend */
export interface PaginationMeta {
  total_count: number;
  page_size: number;
  cursor: string;
  next_cursor: string;
  has_more: boolean;
}

/**
 * Matches `ContentResponse` from the backend (internal/delivery/http/content_response.go).
 * Every Go `*string` / `*time.Time` field is nullable and MUST be typed `T | null` here.
 */
export interface ApiContent {
  id: number;
  title: string | null;
  text_data: string | null;
  ocr_text: string | null;
  caption: string | null;
  link: string | null;
  type: ContentType;
  rank: number; // Relevance rank from full-text search (0 if not searching)
  is_hidden: boolean;
  created_at: string | null;
  updated_at: string | null;
}

/** Matches `ContentSearchResponseWrapper` from the backend */
export interface ApiSearchResponse {
  items: ApiContent[];
  pagination: PaginationMeta;
}

// =============================================================================
// Mappers — convert backend API types to frontend UI types
// =============================================================================

/**
 * Convert a backend ApiContent to a frontend ContentItem.
 *
 * Key transformations:
 * - `id`: number → string
 * - `text` / `url` → single `content` field (text types use `text`, image types use `url`)
 * - `category`: not present in backend, defaults to empty string
 * - `rank`: search relevance rank (0 means not from search)
 * - Dates: ISO string → Date object
 */
export function mapApiContent(apiContent: ApiContent): ContentItem {
  return {
    id: String(apiContent.id),
    type: apiContent.type,
    // Null-safe: the UI type is non-nullable, so defaults are applied here, once.
    title: apiContent.title ?? '',
    content: (apiContent.type === 'text' ? apiContent.text_data : apiContent.link) ?? '',
    category: '', // Backend does not have category field
    rank: apiContent.rank || undefined, // Only include if rank > 0
    createdAt: new Date(apiContent.created_at ?? 0),
    updatedAt: new Date(apiContent.updated_at ?? 0),
  };
}
