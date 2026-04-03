import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/config";
import type { ApiEnvelope, ApiErrorEnvelope } from "@/lib/types";

export const STORAGE_KEYS = {
  accessToken: "ppob_admin_access_token",
  refreshToken: "ppob_admin_refresh_token",
  user: "ppob_admin_user",
  permissions: "ppob_admin_permissions",
} as const;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = window.localStorage.getItem(STORAGE_KEYS.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function unwrapResponse<T>(promise: Promise<{ data: ApiEnvelope<T> }>) {
  const response = await promise;
  return response.data.data;
}

export function extractApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorEnvelope | undefined;
    return (
      data?.error?.message ||
      error.response?.statusText ||
      error.message ||
      "Terjadi kesalahan saat menghubungi server admin"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan saat menghubungi server admin";
}

export function isUnauthorizedError(error: unknown) {
  if (!axios.isAxiosError(error)) return false;
  return error.response?.status === 401;
}

export type ApiClientError = AxiosError<ApiErrorEnvelope>;
