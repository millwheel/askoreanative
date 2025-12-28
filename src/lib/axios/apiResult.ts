import type { ApiError } from "@/lib/axios/apiError";

export type ApiResult<T> = {
  data: T | null;
  error: ApiError | null;
  status: number | null;
};
