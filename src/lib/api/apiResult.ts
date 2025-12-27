import type { ApiError } from "@/type/error";

export type ApiResult<T> = {
  data: T | null;
  error: ApiError | null;
  status: number | null;
};