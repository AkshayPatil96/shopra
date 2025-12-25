import 'express';
// import { } from '@repo/db-mongodb';


declare global {
  namespace Express {
    interface Request {
      serviceName?: string;
      /** Preferred unique identifier for request */
      traceId?: string;
      /** Alias retained for backward compatibility */
      requestId?: string;
      user?: import('@repo/db-mongodb').User;
      seller?: import('@repo/db-mongodb').Seller;
      auth?: {
        userId: string;
        role: "user" | "seller";
      };
    }
  }
}

export { };