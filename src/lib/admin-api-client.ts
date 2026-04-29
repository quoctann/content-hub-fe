/**
 * Admin API Client
 *
 * Separate Axios instance for admin API calls.
 * Injects `Authorization: Bearer <token>` from the auth store on every request.
 * On 401 responses, clears the auth store and redirects to /admin/login.
 */

import { env } from '@/config/env';
import { useAuthStore } from '@/stores/auth.store';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

const adminApiClient: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Inject Bearer token from auth store */
adminApiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/** On 401, logout and redirect to login page */
adminApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/admin/login';
    }
    if (error.response) {
      console.error(
        `[Admin API Error] ${error.response.status}: ${error.response.statusText}`,
        error.response.data,
      );
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
