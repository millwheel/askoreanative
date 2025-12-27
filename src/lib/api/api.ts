import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import apiClient from "./apiClient";
import { ApiResult } from "./apiResult";
import { ApiError } from "@/type/error";

function fallbackApiError(
  message: string,
  status: number | null = null,
): ApiError {
  const now = new Date().toISOString();
  return {
    timestamp: now,
    status: status ?? 0,
    error: status ? "HTTP Error" : "Network Error",
    message,
    path: "unknown",
  };
}

function toApiError(err: unknown): ApiError {
  const ax = err as AxiosError<ApiError>;
  if (ax?.response?.data) {
    return ax.response.data;
  }
  if (ax?.message) {
    const status = ax.response?.status ?? null;
    return fallbackApiError(ax.message, status);
  }
  return fallbackApiError("알 수 없는 오류가 발생했습니다.");
}

async function wrap<T>(p: Promise<AxiosResponse<T>>): Promise<ApiResult<T>> {
  try {
    const res = await p;
    return { data: res.data as T, error: null, status: res.status ?? null };
  } catch (err) {
    return {
      data: null,
      error: toApiError(err),
      status: (err as AxiosError)?.response?.status ?? null,
    };
  }
}

export function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  return wrap<T>(apiClient.get<T>(url, config));
}

export function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) {
  return wrap<T>(apiClient.post<T>(url, body, config));
}

export function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) {
  return wrap<T>(apiClient.put<T>(url, body, config));
}

export function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
) {
  return wrap<T>(apiClient.patch<T>(url, body, config));
}

export function apiDelete<T>(url: string, config?: AxiosRequestConfig) {
  return wrap<T>(apiClient.delete<T>(url, config));
}
