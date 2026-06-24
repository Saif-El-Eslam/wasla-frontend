import axios, { AxiosError, type AxiosRequestConfig, type Method } from 'axios';
import type { ApiEnvelope } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

function currentLocale() {
  if (typeof window === 'undefined') {
    return 'en';
  }

  return window.location.pathname.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
}

export const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  config.headers.set('x-locale', currentLocale());

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data as { error?: { message?: string } } | undefined;

    return Promise.reject(
      new ApiError(payload?.error?.message ?? error.message ?? 'Request failed', status, payload ?? error),
    );
  },
);

export function toQueryString(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const config: AxiosRequestConfig = {
    url: path,
    method: (init?.method ?? 'GET') as Method,
    data: init?.body,
    headers: init?.headers as AxiosRequestConfig['headers'],
    signal: init?.signal ?? undefined,
  };

  const response = await axiosClient.request<ApiEnvelope<T>>(config);

  return response.data.data;
}
