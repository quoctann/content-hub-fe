/**
 * Content types for the Content Hub application
 */

// =============================================================================
// Frontend types (used by UI components)
// =============================================================================

export type ContentType = "text" | "image";

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  category: string;
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

/** Matches `domain.Content` from the backend */
export interface ApiContent {
  id: number;
  title: string;
  // Backend returns `text_data` for text content (nullable)
  text_data?: string | null;
  link: string;
  type: ContentType;
  created_at: string;
  updated_at: string;
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
 * - Dates: ISO string → Date object
 */
export function mapApiContent(apiContent: ApiContent): ContentItem {
  return {
    id: String(apiContent.id),
    type: apiContent.type,
    title: apiContent.title,
    content:
        apiContent.type === "image" ? apiContent.link : (apiContent.text_data ?? ''),
    category: "", // Backend does not have category field
    createdAt: new Date(apiContent.created_at),
    updatedAt: new Date(apiContent.updated_at),
  };
}
