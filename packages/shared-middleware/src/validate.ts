import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "@repo/error-handler";

type Source = "body" | "query" | "params";

// Minimal schema interface to avoid direct zod dependency
type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: any };

type SchemaLike<T = unknown> = {
  safeParse: (data: unknown) => SafeParseResult<T>;
};

/**
 * Generic Zod-based validation middleware.
 * Validates req[source] → replaces with parsed data → forwards 422 on error.
 */
export function validate<T = unknown>(
  schema: SchemaLike<T>,
  source: Source = "body"
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse((req as any)[source]);

    if (!parsed.success) {
      // Correct: Forward error to Express error handler
      return next(
        new ValidationError(
          "Validation Error",
          parsed.error.flatten(),
          "auth-service"
        )
      );
    }

    // Replace raw data with validated data
    (req as any)[source] = parsed.data;
    return next();
  };
}

export const validateBody = <T = unknown>(schema: SchemaLike<T>) => {
  return validate(schema, "body");
}

export const validateQuery = <T = unknown>(schema: SchemaLike<T>) =>
  validate(schema, "query");

export const validateParams = <T = unknown>(schema: SchemaLike<T>) =>
  validate(schema, "params");
