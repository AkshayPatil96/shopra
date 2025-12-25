import { NextFunction, Request, Response } from "express";
import { verifyAccessToken, type AccessTokenPayload, type AuthRole } from "./jwt.js";

export type { AuthRole } from "./jwt.js";

export interface AuthContext {
  userId: string;
  role: AuthRole;
}

const respondUnauthorized = (res: Response) => res.status(401).json({ message: "Unauthorized" });
const respondForbidden = (res: Response) => res.status(403).json({ message: "Forbidden" });

const ensureRoleAllowed = (context: AuthContext, allowedRoles?: AuthRole[]) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  return allowedRoles.includes(context.role);
};

const toAuthContext = (payload: AccessTokenPayload): AuthContext => ({
  userId: payload.sub,
  role: payload.role,
});

export const authenticate =
  (allowedRoles?: AuthRole[]) =>
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
          return respondUnauthorized(res);
        }

        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        const context = toAuthContext(payload);

        if (!ensureRoleAllowed(context, allowedRoles)) {
          return respondForbidden(res);
        }

        req.auth = context;
        return next();
      } catch {
        return respondUnauthorized(res);
      }
    };

const USER_ID_HEADER = "x-user-id";
const USER_ROLE_HEADER = "x-user-role";

const createGatewayAuthGuard = (allowedRoles?: AuthRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const userIdHeader = req.headers[USER_ID_HEADER];
    const roleHeader = req.headers[USER_ROLE_HEADER];

    if (typeof userIdHeader !== "string" || typeof roleHeader !== "string") {
      return respondUnauthorized(res);
    }

    if (roleHeader !== "user" && roleHeader !== "seller") {
      return respondUnauthorized(res);
    }

    const context: AuthContext = {
      userId: userIdHeader,
      role: roleHeader,
    };

    if (!ensureRoleAllowed(context, allowedRoles)) {
      return respondForbidden(res);
    }

    req.auth = context;
    return next();
  };

export const isAuthenticated = createGatewayAuthGuard();
export const isAuthenticatedUser = createGatewayAuthGuard(["user"]);
export const isAuthenticatedSeller = createGatewayAuthGuard(["seller"]);
