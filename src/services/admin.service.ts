/**
 * Admin Service
 *
 * All API calls for the admin dashboard.
 * Uses the adminApiClient (cookie-based auth with CSRF) instead of the public apiClient.
 *
 * Endpoints:
 *   POST   /account/login                — Login (sets HttpOnly cookies)
 *   POST   /account/refresh              — Refresh access token (reads refresh_token cookie)
 *   POST   /account/logout               — Logout (clears all cookies)
 *   GET    /admin/contents               — List all content (paginated + filtered)
 *   GET    /admin/contents/:id           — Get single content by ID
 *   POST   /admin/contents               — Create new content
 *   PUT    /admin/contents/:id           — Update content
 *   DELETE /admin/contents/:id           — Hard delete
 *   PATCH  /admin/contents/:id/hide      — Toggle hide/visible
 */

import { env } from '@/config/env';
import { adminDelete, adminGet, adminPatch, adminPost, adminPut } from '@/lib/admin-api-client';
import type {
  AdminContent,
  AdminContentCreatePayload,
  AdminContentUpdatePayload,
  AdminListResponse,
  AdminSearchFilter,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from '@/types/admin';
import axios from 'axios';

// =============================================================================
// Auth
// =============================================================================

export async function adminLogin(req: LoginRequest): Promise<LoginResponse> {
  const res = await axios.post<LoginResponse>(`${env.API_BASE_URL}/account/login`, req, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });
  return res.data;
}

export async function adminRefreshToken(): Promise<RefreshResponse> {
  const res = await axios.post<RefreshResponse>(
    `${env.API_BASE_URL}/account/refresh`,
    {},
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    },
  );
  return res.data;
}

export async function adminLogout(): Promise<void> {
  await axios.post(
    `${env.API_BASE_URL}/account/logout`,
    {},
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    },
  );
}

// =============================================================================
// Content CRUD
// =============================================================================

/**
 * List all content items (admin view — includes hidden).
 * Supports pagination and optional search/filter.
 */
export async function adminListContent(
  filter: AdminSearchFilter = {},
  page: number = 1,
  pageSize: number = 10,
): Promise<AdminListResponse> {
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };
  if (filter.q) params.keywords = filter.q;
  if (filter.type) params.type = filter.type;
  if (filter.visible === 'true' || filter.visible === 'false') {
    params.visible = filter.visible;
  }
  return adminGet<AdminListResponse>('/admin/contents', { params });
}

/** Get a single content item by ID */
export async function adminGetById(id: number): Promise<AdminContent> {
  return adminGet<AdminContent>(`/admin/contents/${id}`);
}

/** Create a new content item */
export async function adminCreateContent(
  payload: AdminContentCreatePayload,
): Promise<AdminContent> {
  return adminPost<AdminContent>('/admin/contents', payload);
}

/** Update an existing content item */
export async function adminUpdateContent(
  id: number,
  payload: AdminContentUpdatePayload,
): Promise<AdminContent> {
  return adminPut<AdminContent>(`/admin/contents/${id}`, payload);
}

/** Hard-delete a content item */
export async function adminDeleteContent(id: number): Promise<void> {
  return adminDelete<void>(`/admin/contents/${id}`);
}

/**
 * Toggle hide/visible for a single item.
 * PATCH /admin/contents/:id/hide  { hidden: boolean }
 */
export async function adminToggleHide(id: number, hidden: boolean): Promise<AdminContent> {
  return adminPatch<AdminContent>(`/admin/contents/${id}/hide`, { hidden });
}

/**
 * Bulk toggle hide/visible for multiple items.
 * Fires sequential PATCH calls and returns updated items.
 */
export async function adminBulkToggleHide(ids: number[], hidden: boolean): Promise<AdminContent[]> {
  return Promise.all(ids.map((id) => adminToggleHide(id, hidden)));
}
/**
 * Bulk delete multiple items.
 * Fires a single DELETE call with IDs in the body.
 */
export async function adminBulkDeleteContent(ids: number[]): Promise<void> {
  await adminDelete('/admin/contents/bulk-delete', { data: { ids } });
}
