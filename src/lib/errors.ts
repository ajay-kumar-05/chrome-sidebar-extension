/**
 * Typed errors for the AI client so callers can react to the *kind* of failure
 * (bad key, rate limit, network) instead of pattern-matching a string.
 */

/** Any non-OK HTTP response from the provider. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** 401 / 403 — the API key is missing, invalid or lacks access. */
export class AuthError extends ApiError {
  constructor(message: string, status?: number) {
    super(message, status);
    this.name = 'AuthError';
  }
}

/** 429 — too many requests / quota exceeded. */
export class RateLimitError extends ApiError {
  constructor(message: string, status?: number) {
    super(message, status);
    this.name = 'RateLimitError';
  }
}

/** Request never reached the provider, or timed out. */
export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

/** Map an HTTP status + detail to the most specific ApiError subclass. */
export function errorFromStatus(status: number, detail: string): ApiError {
  if (status === 401 || status === 403) return new AuthError(detail, status);
  if (status === 429) return new RateLimitError(detail, status);
  return new ApiError(detail, status);
}

/** True when a thrown value represents an aborted (cancelled/timed-out) request. */
export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}
