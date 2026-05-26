/**
 * Admin API Client
 *
 * Separate Axios instance for admin API calls.
 * - Sends cookies automatically via `withCredentials: true`
 * - Attaches `X-CSRF-Token` header from auth store on every mutating request
 * - On 401, attempts a silent token refresh before logging out
 */

import { env } from '@/config/env';
import { useAuthStore } from '@/stores/auth.store';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

const adminApiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(undefined);
    }
  });
  failedQueue = [];
}

adminApiClient.interceptors.request.use(
  (config) => {
    const csrfToken = useAuthStore.getState().csrfToken;
    if (csrfToken && config.method && config.method !== 'get' && config.method !== 'head') {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

adminApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => adminApiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post<{ csrf_token: string; expires_in: number }>(
          `${env.API_BASE_URL}/account/refresh`,
          {},
          { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
        );

        const { csrf_token, expires_in } = res.data;
        useAuthStore.getState().updateAccessToken(csrf_token, expires_in);

        processQueue(null);

        if (csrf_token && originalRequest.method !== 'get' && originalRequest.method !== 'head') {
          originalRequest.headers['X-CSRF-Token'] = csrf_token;
        }

        return adminApiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().logout();
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      if (env.IS_DEV) {
        console.error(
          `[Admin API Error] ${error.response.status}: ${error.response.statusText}`,
          error.response.data,
        );
      } else {
        console.error(`[Admin API Error] ${error.response.status}: ${error.response.statusText}`);
      }
    } else {
      console.error('[Admin API Error]', error.message);
    }
    return Promise.reject(error);
  },
);

export async function adminGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await adminApiClient.get<T>(url, config);
  return res.data;
}

export async function adminPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await adminApiClient.post<T>(url, data, config);
  return res.data;
}

export async function adminPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await adminApiClient.put<T>(url, data, config);
  return res.data;
}

export async function adminPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await adminApiClient.patch<T>(url, data, config);
  return res.data;
}

export async function adminDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await adminApiClient.delete<T>(url, config);
  return res.data;
}

export default adminApiClient;
