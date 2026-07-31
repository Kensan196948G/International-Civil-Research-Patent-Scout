export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function badRequest(message: string, details?: unknown): HttpError {
  return new HttpError(400, "bad_request", message, details);
}

export function unauthorized(message = "認証が必要です"): HttpError {
  return new HttpError(401, "unauthorized", message);
}

export function forbidden(message = "権限がありません"): HttpError {
  return new HttpError(403, "forbidden", message);
}

export function notFound(message = "リソースが見つかりません"): HttpError {
  return new HttpError(404, "not_found", message);
}

export function conflict(message: string): HttpError {
  return new HttpError(409, "conflict", message);
}
