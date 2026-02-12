/**
 * Content types for the Content Hub application
 */

// =============================================================================
// Frontend types (used by UI components)
// =============================================================================

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

// =============================================================================
// Backend API types (matching Go domain structs exactly)
// These mirror the JSON shape returned by the Content Hub backend.
// =============================================================================

/** Matches `domain.Tag` from the backend */
export interface ApiTag {
  id: number;
  name: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/** Matches `domain.Content` from the backend */
export interface ApiContent {
  id: number;
  title: string;
  search_data: string;
  link: string;
  type: ContentType;
  tags: ApiTag[] | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Mappers — convert backend API types to frontend UI types
// =============================================================================

/**
 * Convert a backend ApiTag to a frontend Tag.
 */
export function mapApiTag(apiTag: ApiTag): Tag {
  return {
    id: String(apiTag.id),
    name: apiTag.name,
  };
}

/**
 * Convert a backend ApiContent to a frontend ContentItem.
 *
 * Key transformations:
 * - `id`: number → string
 * - `text` / `url` → single `content` field (text types use `text`, image types use `url`)
 * - `tags`: ApiTag[] → Tag[] (with id number → string)
 * - `category`: not present in backend, defaults to empty string
 * - Dates: ISO string → Date object
 */
export function mapApiContent(apiContent: ApiContent): ContentItem {
  return {
    id: String(apiContent.id),
    type: apiContent.type,
    title: apiContent.title,
    content:
      apiContent.type === "image" ? apiContent.link : apiContent.search_data,
    tags: (apiContent.tags || []).map(mapApiTag),
    category: "", // Backend does not have category field
    createdAt: new Date(apiContent.created_at),
    updatedAt: new Date(apiContent.updated_at),
  };
}
