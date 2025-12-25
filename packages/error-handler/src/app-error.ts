import { ErrorCode } from "./error-codes.js";

export interface AppErrorOptions {
  code?: ErrorCode;
  statusCode?: number;
  isOperational?: boolean;
  details?: any;
  serviceName?: string; // which microservice threw this
  cause?: Error;        // optional underlying error
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly code: ErrorCode;
  public readonly serviceName?: string;
  public override readonly cause?: Error;

  constructor(
    message: string,
    {
      code = ErrorCode.INTERNAL_ERROR,
      statusCode = 500,
      isOperational = true,
      details,
      serviceName,
      cause,
    }: AppErrorOptions = {},
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    this.serviceName = serviceName;
    this.cause = cause;

    Error.captureStackTrace(this);
  }
}
