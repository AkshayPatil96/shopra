import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

export const requestIdMiddleware = (serviceName?: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const id = (req.headers["x-request-id"] as string) || randomUUID();
    // Populate both fields for compatibility
    req.requestId = id;
    req.traceId = id;

    // Add serviceName if needed
    if (serviceName) {
      req.serviceName = serviceName;
    }

    next();
  };
};
