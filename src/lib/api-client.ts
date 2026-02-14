/**
 * API Client
 *
 * Centralized Axios instance for communicating with the Content Hub backend.
 * Handles base URL resolution, API key authentication, and error handling.
 *
 * Architecture notes:
 * - Uses Axios interceptors for consistent auth header injection
 * - Response interceptor provides centralized error logging
 * - All API modules should import this client instead of creating their own Axios instances
 *
 * Environment-aware base URL:
 * - LOCAL DEV: Requests go to "/api/..." which the Vite dev server proxies
 *   to the backend (e.g., http://localhost:8080). This avoids CORS issues
 *   because the browser sees same-origin requests. See vite.config.ts for
 *   the proxy configuration.
 * - PRODUCTION: Requests go to the full backend URL set via VITE_API_BASE_URL
 *   (e.g., https://api.example.com). CORS must be handled by the backend
 *   or a reverse proxy in production.
 */

import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { env } from "@/config/env";

/**
 * Create and configure the Axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor — injects the X-API-Key header on every request.
 * The API key is read from environment config (VITE_API_KEY).
 */
apiClient.interceptors.request.use(
  (config) => {
    if (env.API_KEY) {
      config.headers["X-API-Key"] = env.API_KEY;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor — centralized error handling and logging.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      // Server responded with an error status
      console.error(
        `[API Error] ${error.response.status}: ${error.response.statusText}`,
        error.response.data,
      );
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error("[API Error] No response received:", error.message);
    } else {
      // Something went wrong setting up the request
      console.error("[API Error] Request setup failed:", error.message);
    }
    return Promise.reject(error);
  },
);

/**
 * Type-safe GET request helper.
 *
 * @example
 * const contents = await apiGet<Content[]>("/contents", { params: { q: "hello" } });
 */
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

/**
 * Type-safe POST request helper.
 *
 * @example
 * const newContent = await apiPost<Content>("/contents", { title: "Hello", text: "World" });
 */
export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

/**
 * Type-safe PUT request helper.
 */
export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

/**
 * Type-safe DELETE request helper.
 */
export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

export default apiClient;
