import { AppError, ErrorCode } from "@repo/error-handler";
import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (serviceName: string) => {
  return (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {

    let normalized: AppError;

    if (err instanceof AppError) {
      normalized = err;
    } else {
      normalized = new AppError("Internal Server Error", {
        statusCode: 500,
        code: ErrorCode.INTERNAL_ERROR,
        isOperational: false,
        serviceName,
        cause: err,
      });
    }

    return res.status(normalized.statusCode).json({
      status: "error",
      error: {
        code: normalized.code,
        message: normalized.message,
        statusCode: normalized.statusCode,
        service: serviceName,
        requestId: req.requestId,
        ...(normalized.details && { details: normalized.details })
      },
    });
  };
};
