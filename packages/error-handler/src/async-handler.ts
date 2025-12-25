import { NextFunction, Request, Response } from "express";

/**
 * Production-grade async handler wrapper.
 * - Captures both sync + async errors
 * - Adds request metadata to every error (requestId, endpoint, ip, userAgent)
 * - Fully typed with preserved req/res generics
 * - Non-blocking: failures in context attachment never stop error flow
 */
export const asyncHandler =
  <T extends Request = Request, U extends Response = Response>(
    fn: (req: T, res: U, next: NextFunction) => Promise<any>
  ) =>
    (req: T, res: U, next: NextFunction): void => {
      const attachContext = (error: any) => {
        try {
          const headerRequestId = req.headers["x-request-id"] as string | undefined;
          const middlewareRequestId = (req as any).requestId; // set by your requestIdMiddleware

          const generatedRequestId =
            `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

          const finalRequestId =
            middlewareRequestId ||
            headerRequestId ||
            generatedRequestId;

          // Assign metadata safely only if missing
          if (!("requestId" in error)) error.requestId = finalRequestId;
          if (!("endpoint" in error)) error.endpoint = `${req.method} ${req.originalUrl}`;
          if (!("ip" in error)) error.ip = req.ip;
          if (!("userAgent" in error)) error.userAgent = req.headers["user-agent"];
        } catch {
          // Fail silently — never interrupt error flow
        }
      };

      // Handle both sync and async errors
      Promise.resolve(fn(req, res, next)).catch((error) => {
        console.log('error: ', error);
        attachContext(error);
        next(error);
      });
    };
