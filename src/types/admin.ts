/**
 * Admin-specific TypeScript types
 *
 * Mirrors the backend Go domain structs for the admin API.
 * These are separate from the public ContentItem types used by the client UI.
 */

import type { ContentType } from '@/types/content';

// =============================================================================
// Auth
// =============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  csrf_token: string;
  expires_in: number;
}

export interface RefreshResponse {
  csrf_token: string;
  expires_in: number;
}

// =============================================================================
// Admin Content (full field set, including admin-only fields)
// =============================================================================

/** Matches the full ContentResponse from the backend (admin endpoints) */
export interface AdminContent {
  id: number;
  title: string | null;
  text_data: string | null;
  ocr_text: string | null;
  caption: string | null;
  link: string | null;
  type: ContentType;
  is_hidden: boolean;
  rank: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

/** Payload for creating a new content item */
export interface AdminContentCreatePayload {
  title?: string;
  text_data?: string;
  ocr_text?: string;
  caption?: string;
  link?: string;
  type: ContentType;
}

/** Payload for updating an existing content item (all optional except id) */
export interface AdminContentUpdatePayload {
  title?: string | null;
  text_data?: string | null;
  ocr_text?: string | null;
  caption?: string | null;
  link?: string | null;
  type?: ContentType;
  is_hidden?: boolean;
}

// =============================================================================
// Admin List Response
// =============================================================================

export interface AdminPagination {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminListResponse {
  items: AdminContent[];
  pagination: AdminPagination;
}

// =============================================================================
// Admin Search Filter
// =============================================================================

export interface AdminSearchFilter {
  q?: string;
  type?: ContentType | '';
  visible?: 'true' | 'false' | '';
}
