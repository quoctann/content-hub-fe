/**
 * Content Service
 *
 * Service layer that communicates with the Content Hub backend API.
 * Uses the centralized Axios API client for all HTTP requests.
 *
 * Backend API endpoints:
 * - GET  /contents?keywords=<query>&type=<type>&num=<count>&cursor=<id>  — Search contents
 * - POST /contents                                      — Create content
 * - PUT  /contents/:id                                  — Update content
 *
 * All requests are authenticated via X-API-Key header (handled by api-client).
 */

import type {
  ApiContent,
  ContentItem,
  ContentType,
  SearchFilter,
  SearchResponse,
} from "@/types/content";
import { mapApiContent } from "@/types/content";
import { apiGet } from "@/lib/api-client";

// Default number of results per page
const DEFAULT_PAGE_SIZE = 10;

/**
 * Parse search query string into structured filter
 * Supports: @image/@text for type filtering
 */
export function parseSearchQuery(query: string): SearchFilter {
  const categories: string[] = [];
  let keyword = query;
  let type: ContentType | undefined;

  // Extract type filter (e.g., @image, @text, @i, @t)
  const typeMatches = query.match(/@(image|text|i|t)\b/gi);
  if (typeMatches) {
    const typeStr = typeMatches[0].slice(1).toLowerCase();
    type = typeStr === "i" || typeStr === "image" ? "image" : "text";
    typeMatches.forEach((t) => {
      keyword = keyword.replace(t, "");
    });
  }

  // Clean up keyword
  keyword = keyword.trim().replace(/\s+/g, " ");

  return {
    keyword: keyword || undefined,
    categories: categories.length > 0 ? categories : undefined,
    type,
  };
}

/**
 * Search content items using the backend API.
 *
 * The backend uses cursor-based pagination:
 * - `keywords`: comma-separated search keywords
 * - `num`: number of results to return
 * - `cursor`: the last item ID from the previous page (for loading more)
 *
 * @param filter - Parsed search filter (keyword is sent as `keywords` param)
 * @param page - Page number (used to calculate if this is the first page)
 * @param pageSize - Number of results per page
 * @param cursor - Cursor for pagination (last item ID from previous results)
 */
export async function searchContent(
  filter: SearchFilter,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  cursor?: string,
): Promise<SearchResponse> {
  // Build query parameters for the backend API
  const params: Record<string, string | number> = {
    num: pageSize,
  };

  // Send keyword as the `keywords` parameter
  if (filter.keyword) {
    params.keywords = filter.keyword;
  }

  // Send type filter
  if (filter.type) {
    params.type = filter.type;
  }

  // Pass cursor for pagination (skip on first page)
  if (cursor && page > 1) {
    params.cursor = cursor;
  }

  // Call the backend search API
  const apiContents = await apiGet<ApiContent[]>("/contents", { params });

  // Map backend types to frontend types
  const items = apiContents.map(mapApiContent);

  // Determine if there are more results
  // If the backend returned exactly `pageSize` items, there are likely more
  const hasMore = apiContents.length >= pageSize;

  return {
    items,
    total: items.length,
    page,
    pageSize,
    hasMore,
  };
}

/**
 * Get a single content item by ID (client-side search from loaded items)
 * TODO: Add a dedicated backend endpoint GET /contents/:id when available
 */
export async function getContentById(id: string): Promise<ContentItem | null> {
  const response = await searchContent({}, 1, 100);
  return response.items.find((item) => item.id === id) || null;
}

/**
 * Download content as a file
 */
export function downloadContent(item: ContentItem): void {
  if (!item.content) return;

  if (item.type === "text") {
    const blob = new Blob([item.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.title.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else if (item.type === "image") {
    // For images, open in new tab (in real app, would trigger actual download)
    window.open(item.content, "_blank");
  }
}

/**
 * Copy content to clipboard
 * For images, copies the actual image data so it can be pasted in apps like Facebook, Telegram, etc.
 */
export async function copyToClipboard(item: ContentItem): Promise<boolean> {
  if (!item.content) return false;

  try {
    if (item.type === "text") {
      await navigator.clipboard.writeText(item.content);
      return true;
    } else if (item.type === "image") {
      // Fetch the image and copy as blob data
      const response = await fetch(item.content);
      const blob = await response.blob();

      // Convert to PNG if needed (clipboard API works best with PNG)
      let imageBlob = blob;
      if (blob.type !== "image/png") {
        imageBlob = await convertToPng(blob);
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": imageBlob,
        }),
      ]);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Convert an image blob to PNG format
 */
async function convertToPng(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          resolve(pngBlob);
        } else {
          reject(new Error("Failed to convert to PNG"));
        }
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.crossOrigin = "anonymous";
    img.src = URL.createObjectURL(blob);
  });
}
