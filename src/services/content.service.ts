/**
 * Content Service
 *
 * This service layer abstracts data fetching from the UI components.
 * Currently uses mock data, but can be easily switched to real API calls.
 *
 * To switch to real backend:
 * 1. Replace mock implementations with actual fetch/axios calls
 * 2. Update the API endpoints as needed
 * 3. Keep the same interface for backward compatibility
 */

import type {
  ContentItem,
  SearchFilter,
  SearchResponse,
  ContentType,
} from "@/types/content";
import { mockContentItems } from "@/data/mock-content";

// Simulated API delay for realistic behavior
const MOCK_DELAY = 300;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Parse search query string into structured filter
 * Supports: # for tags, @image/@text for type filtering
 */
export function parseSearchQuery(query: string): SearchFilter {
  // const filter: SearchFilter = {};
  const tags: string[] = [];
  const categories: string[] = [];
  let keyword = query;
  let type: ContentType | undefined;

  // Extract tags (e.g., #fun, #beauty)
  const tagMatches = query.match(/#(\w+)/g);
  if (tagMatches) {
    tagMatches.forEach((tag) => {
      tags.push(tag.slice(1).toLowerCase());
      keyword = keyword.replace(tag, "");
    });
  }

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
    tags: tags.length > 0 ? tags : undefined,
    categories: categories.length > 0 ? categories : undefined,
    type,
  };
}

/**
 * Search content items based on filter criteria
 */
export async function searchContent(
  filter: SearchFilter,
  page: number = 1,
  pageSize: number = 10,
): Promise<SearchResponse> {
  await delay(MOCK_DELAY);

  let filteredItems = [...mockContentItems];

  // Filter by type
  if (filter.type) {
    filteredItems = filteredItems.filter((item) => item.type === filter.type);
  }

  // Filter by tags
  if (filter.tags && filter.tags.length > 0) {
    filteredItems = filteredItems.filter((item) =>
      filter.tags!.some((tag) =>
        item.tags.some((itemTag) => itemTag.name.toLowerCase().includes(tag)),
      ),
    );
  }

  // Filter by keyword
  if (filter.keyword) {
    const lowerKeyword = filter.keyword.toLowerCase();
    filteredItems = filteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerKeyword) ||
        item.content.toLowerCase().includes(lowerKeyword) ||
        item.category.toLowerCase().includes(lowerKeyword),
    );
  }

  // Pagination
  const total = filteredItems.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    hasMore: startIndex + pageSize < total,
  };
}

/**
 * Get a single content item by ID
 */
export async function getContentById(id: string): Promise<ContentItem | null> {
  await delay(MOCK_DELAY);
  return mockContentItems.find((item) => item.id === id) || null;
}

/**
 * Download content as a file
 */
export function downloadContent(item: ContentItem): void {
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
