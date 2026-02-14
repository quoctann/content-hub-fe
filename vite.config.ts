import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
// https://ui.shadcn.com/docs/installation/vite
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  /**
   * Development server proxy configuration.
   *
   * WHY: During local development (`npm run dev`), the Vite dev server runs on
   * a different port (e.g., 5173) than the backend API (e.g., 8080). Browsers
   * block cross-origin requests (CORS) by default. Instead of configuring CORS
   * on the backend, we use Vite's built-in proxy to forward API requests:
   *
   *   Browser → http://localhost:5173/api/contents
   *           → Vite proxy rewrites to → http://localhost:8080/contents
   *
   * The `/api` prefix is stripped during the rewrite so it matches the backend
   * routes. This proxy ONLY runs during development — in production, the
   * VITE_API_BASE_URL env var points directly to the backend.
   *
   * @see src/config/env.ts — how the base URL is resolved per environment
   * @see src/lib/api-client.ts — the Axios client that uses this base URL
   */
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
