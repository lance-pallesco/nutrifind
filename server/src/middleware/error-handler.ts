import type { ErrorRequestHandler, RequestHandler } from "express";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", "Route not found."));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next;
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const code = error instanceof AppError ? error.code : "INTERNAL_ERROR";
  const message =
    error instanceof AppError ? error.message : "An unexpected error occurred.";
  const requestId = res.locals.requestId;

  if (statusCode >= 500) {
    console.error({ requestId, error });
  }

  res.status(statusCode).json({
    error: { code, message, requestId },
  });
};
