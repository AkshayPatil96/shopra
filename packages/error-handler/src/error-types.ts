import { AppError } from "./app-error.js";
import { ErrorCode } from "./error-codes.js";

export class ValidationError extends AppError {
  constructor(message = "Invalid request data", details?: any, serviceName?: string) {
    super(message, {
      statusCode: 422, // ✅ 422 for schema validation
      code: ErrorCode.VALIDATION_ERROR,
      isOperational: true,
      details,
      serviceName,
    });
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized", details?: any, serviceName?: string) {
    super(message, {
      statusCode: 401,
      code: ErrorCode.AUTH_ERROR,
      isOperational: true,
      details,
      serviceName,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: any, serviceName?: string) {
    super(message, {
      statusCode: 403,
      code: ErrorCode.FORBIDDEN,
      isOperational: true,
      details,
      serviceName,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: any, serviceName?: string) {
    super(message, {
      statusCode: 404,
      code: ErrorCode.NOT_FOUND,
      isOperational: true,
      details,
      serviceName,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: any, serviceName?: string) {
    super(message, {
      statusCode: 409,
      code: ErrorCode.CONFLICT,
      isOperational: true,
      details,
      serviceName,
    });
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", details?: any, serviceName?: string) {
    super(message, {
      statusCode: 400,
      code: ErrorCode.BAD_REQUEST,
      isOperational: true,
      details,
      serviceName,
    });
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any, cause?: Error, serviceName?: string) {
    super(message, {
      statusCode: 500,
      code: ErrorCode.DATABASE_ERROR,
      isOperational: false,
      details,
      cause,
      serviceName,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", details?: any, serviceName?: string) {
    super(message, {
      statusCode: 429,
      code: ErrorCode.RATE_LIMIT,
      isOperational: true,
      details,
      serviceName,
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service error", details?: any, cause?: Error, serviceName?: string) {
    super(message, {
      statusCode: 502,
      code: ErrorCode.EXTERNAL_SERVICE_ERROR,
      isOperational: false,
      details,
      cause,
      serviceName,
    });
  }
}

export class JsonWebTokenError extends AppError {
  constructor(message = "JSON Web Token error", details?: any, serviceName?: string) {
    super(message, {
      statusCode: 401,
      code: ErrorCode.JWT_ERROR,
      isOperational: true,
      details,
      serviceName,
    });
  }
}