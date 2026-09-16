import type { NextFunction, Request, RequestHandler, Response } from "express";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const badRequest = (message = "Invalid request", code = "bad_request") =>
  new ApiError(400, message, code);

export const unauthorized = (message = "Unauthorized", code = "unauthorized") =>
  new ApiError(401, message, code);

export const forbidden = (message = "Forbidden", code = "forbidden") =>
  new ApiError(403, message, code);

export const notFound = (message = "Not found", code = "not_found") =>
  new ApiError(404, message, code);

export const tooMany = (message = "Too many requests", code = "rate_limited") =>
  new ApiError(429, message, code);

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

function sendError(res: Response, status: number, fallbackMessage: string, code?: string) {
  return res.status(status).json({
    error: fallbackMessage,
    ...(code ? { code } : {}),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  sendError(res, 404, "The requested resource was not found.", "not_found");
}

export function errorMiddleware(err: any, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.code ? { code: err.code } : {}),
    });
  }

  if (err?.type === "entity.parse.failed" || (err instanceof SyntaxError && err.message.includes("JSON"))) {
    return sendError(res, 400, "Invalid request body.", "bad_request");
  }

  if (err?.type === "entity.too.large") {
    return sendError(res, 413, "Request body is too large.", "payload_too_large");
  }

  const code: string = err?.code || "";

  if (code.startsWith("auth/")) {
    console.warn("Auth error:", code, err?.message || err);
    return sendError(res, 401, "Your session is invalid. Please sign in again.", "unauthorized");
  }

  if (code.startsWith("firestore/")) {
    console.warn("Firestore error:", code, err?.message || err);
    return sendError(res, 503, "Something went wrong while saving your data. Please try again.", "service_unavailable");
  }

  console.error("Unhandled error:", err);
  return sendError(res, 500, "Something went wrong. Please try again.", "internal_error");
}