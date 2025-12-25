import { AppError } from "./index.js";
import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    console.log(
      `Error: ${req.method} ${req.url} - ${err.statusCode} - ${err.message}`
    );

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Unhandled / unknown error
  console.error(`Unhandled Error:`, err);

  return res.status(500).json({
    status: "error",
    message: "Something went wrong, please try again!",
  });
};
