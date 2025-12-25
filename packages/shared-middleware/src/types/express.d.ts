import type { AuthContext } from "../auth-middleware.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export {};
