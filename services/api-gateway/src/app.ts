import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import slowDown from "express-slow-down";
import timeout from "connect-timeout";

import {
  authenticate,
  errorMiddleware,
  requestIdMiddleware,
} from "@repo/shared-middleware";

const app: Application = express();

/* -----------------------------------------------------
   Basic App / Proxy Settings
----------------------------------------------------- */

// Required when behind a reverse proxy (Railway, Render, AWS LB, Nginx)
app.set("trust proxy", 1);

const serviceName = process.env.SERVICE_NAME || "api-gateway";

// Internal service URLs
const AUTH_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3334";
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:3335";
const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3336";

/* -----------------------------------------------------
   Request ID & Logging (FIRST)
----------------------------------------------------- */

app.use(requestIdMiddleware(serviceName));
app.use(morgan("dev"));

/* -----------------------------------------------------
   Security Middleware (EDGE)
----------------------------------------------------- */

// Secure HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false, // APIs need this disabled
  })
);

// Prevent HTTP parameter pollution
app.use(hpp());

// CORS (frontend origins only)
app.use(
  cors({
    origin: ["http://localhost:8000", "http://localhost:8001"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* -----------------------------------------------------
   Performance Middleware
----------------------------------------------------- */

// Compress responses (ONLY at gateway)
app.use(
  compression({
    threshold: 1024, // compress responses > 1KB
    level: 6,        // balanced CPU vs compression
  })
);

// Prevent hanging requests
app.use(timeout("15s"));

/* -----------------------------------------------------
   Body Parsing
----------------------------------------------------- */

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* -----------------------------------------------------
   Auth Header Normalization (Cookies → Authorization)
----------------------------------------------------- */

const ACCESS_TOKEN_USER_COOKIE = "access_token_user";
const ACCESS_TOKEN_SELLER_COOKIE = "access_token_seller";
const REFRESH_TOKEN_USER_COOKIE = "refresh_token_user";
const REFRESH_TOKEN_SELLER_COOKIE = "refresh_token_seller";

const SELLER_PATH_REGEX = /\/api\/(?:product|payment|auth\/seller)/;

const getCookieValue = (
  cookieHeader: string | undefined,
  name: string
): string | undefined => {
  if (!cookieHeader) return undefined;

  for (const segment of cookieHeader.split(";")) {
    const [rawKey, ...rest] = segment.trim().split("=");
    if (rawKey === name) {
      return rest.join("=");
    }
  }
};

const ensureAuthHeaderFromCookies = (req: Request) => {
  if (req.headers.authorization?.startsWith("Bearer ")) return;

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return;

  const path = req.originalUrl || "";

  // Refresh token routes
  if (path.startsWith("/api/auth/user/refresh-token")) {
    const token = getCookieValue(cookieHeader, REFRESH_TOKEN_USER_COOKIE);
    if (token) req.headers.authorization = `Bearer ${token}`;
    return;
  }

  if (path.startsWith("/api/auth/seller/refresh-token")) {
    const token = getCookieValue(cookieHeader, REFRESH_TOKEN_SELLER_COOKIE);
    if (token) req.headers.authorization = `Bearer ${token}`;
    return;
  }

  // Access token routes
  const preferSeller = SELLER_PATH_REGEX.test(path);
  const primary = preferSeller
    ? ACCESS_TOKEN_SELLER_COOKIE
    : ACCESS_TOKEN_USER_COOKIE;
  const fallback = preferSeller
    ? ACCESS_TOKEN_USER_COOKIE
    : ACCESS_TOKEN_SELLER_COOKIE;

  const token =
    getCookieValue(cookieHeader, primary) ||
    getCookieValue(cookieHeader, fallback);

  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
};

const cookieAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  ensureAuthHeaderFromCookies(req);
  next();
};

app.use(cookieAuthMiddleware);

/* -----------------------------------------------------
   Optional Authentication (Non-blocking)
----------------------------------------------------- */

const optionalAuthenticate = (() => {
  const baseAuthenticate = authenticate();

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization?.startsWith("Bearer ")) {
      req.auth = undefined;
      return next();
    }
    return baseAuthenticate(req, res, next);
  };
})();

app.use(optionalAuthenticate);

/* -----------------------------------------------------
   Rate Limiting & Abuse Protection
----------------------------------------------------- */

// Hard rate limit
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: (req: Request) =>
      req.auth ? 1000 : 150,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip ?? ""),
  })
);

// Soft slow-down
app.use(
  slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 100,
    delayMs: () => 500,
  })
);

/* -----------------------------------------------------
   Health Check
----------------------------------------------------- */

app.get("/health", (req: Request, res: Response) => {
  res.json({
    message: `Welcome to ${serviceName}!`,
    requestId: req.requestId,
  });
});

/* -----------------------------------------------------
   Proxy Helpers
----------------------------------------------------- */

const forwardHeaders = (opts: any, req: Request) => {
  const headers = opts.headers ?? {};

  if (req.headers.authorization) {
    headers.authorization = req.headers.authorization;
  }

  if (req.requestId) {
    headers["x-request-id"] = req.requestId;
  }

  if (req.auth) {
    headers["x-user-id"] = req.auth.userId;
    headers["x-user-role"] = req.auth.role;
  }

  opts.headers = headers;
  return opts;
};

/* -----------------------------------------------------
   Proxies
----------------------------------------------------- */

app.use(
  "/api/auth",
  proxy(AUTH_URL, {
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace("/api/auth", ""),
    proxyReqOptDecorator: forwardHeaders,
    timeout: 15000,
    preserveHostHdr: true,
  })
);

app.use(
  "/api/payment",
  proxy(PAYMENT_URL, {
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace("/api/payment", ""),
    proxyReqOptDecorator: forwardHeaders,
    timeout: 15000,
    preserveHostHdr: true,
  })
);

app.use(
  "/api/product",
  proxy(PRODUCT_URL, {
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace("/api/product", ""),
    proxyReqOptDecorator: forwardHeaders,
    timeout: 15000,
    preserveHostHdr: true,
  })
);

/* -----------------------------------------------------
   Error Handling (LAST)
----------------------------------------------------- */

app.use(errorMiddleware(serviceName));

export default app;
