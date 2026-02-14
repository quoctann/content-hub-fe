/**
 * Environment Configuration
 *
 * Typed, validated access to Vite environment variables.
 * All env vars must be prefixed with VITE_ to be exposed to client code.
 *
 * @see https://vite.dev/guide/env-and-mode
 */

/**
 * Resolved environment configuration.
 *
 * NOTE on API_BASE_URL:
 * - In LOCAL DEVELOPMENT, the Vite dev server proxies `/api` requests to the
 *   backend (configured in vite.config.ts). This avoids CORS issues without
 *   requiring backend CORS configuration. So during dev, this resolves to "/api".
 * - In PRODUCTION, this should be the full backend URL (e.g. https://api.example.com)
 *   because there is no Vite dev server to proxy — the SPA is typically served
 *   by a CDN or Nginx and calls the backend directly.
 */
export const env = {
  /**
   * Backend API base URL.
   * During local dev, defaults to "/api" to use the Vite proxy.
   * In production, set via VITE_API_BASE_URL env var.
   */
  API_BASE_URL: import.meta.env.DEV
    ? "/api"
    : (import.meta.env.VITE_API_BASE_URL || ""),

  /** API key for X-API-Key header authentication */
  API_KEY: import.meta.env.VITE_API_KEY || "",

  /** True when running in development mode (npm run dev) */
  IS_DEV: import.meta.env.DEV,

  /** True when running in production mode (npm run build) */
  IS_PROD: import.meta.env.PROD,
} as const;
