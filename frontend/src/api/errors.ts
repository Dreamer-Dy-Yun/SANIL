import type { ApiError, ApiErrorKind } from "./contracts";

export class SanilApiError extends Error implements ApiError {
  readonly kind: ApiErrorKind;
  readonly detail?: unknown;

  constructor(kind: ApiErrorKind, message: string, detail?: unknown) {
    super(message);
    this.name = "SanilApiError";
    this.kind = kind;
    this.detail = detail;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof SanilApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new SanilApiError("server", error.message);
  }

  return new SanilApiError("server", "알 수 없는 오류가 발생했습니다.", error);
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "kind" in error && "message" in error;
}
