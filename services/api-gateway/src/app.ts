import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { authenticate, errorMiddleware, requestIdMiddleware } from "@repo/shared-middleware";

const app: Application = express();

// -------------------- CORS --------------------
app.use(
  cors({
    origin: ["http://localhost:8000", "http://localhost:8001"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Required when behind a reverse proxy (Railway, Render, AWS LB)
app.set("trust proxy", 1);

const serviceName = process.env.SERVICE_NAME || "api-gateway";

// Internal service URLs
const AUTH_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3334";
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:3335";
const PRODUCT_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:3336";

// Attach request ID to every request
app.use(requestIdMiddleware(serviceName));

const ACCESS_TOKEN_USER_COOKIE = "access_token_user";
const ACCESS_TOKEN_SELLER_COOKIE = "access_token_seller";
const REFRESH_TOKEN_USER_COOKIE = "refresh_token_user";
const REFRESH_TOKEN_SELLER_COOKIE = "refresh_token_seller";
const SELLER_PATH_REGEX = /\/api\/(?:product|payment|auth\/seller)/;

const getCookieValue = (cookieHeader: string | undefined, name: string): string | undefined => {
  if (!cookieHeader) {
    return undefined;
  }

  for (const segment of cookieHeader.split(";")) {
    const [rawKey, ...rest] = segment.trim().split("=");
    if (rawKey === name) {
      return rest.join("=");
    }
  }

  return undefined;
};

const ensureAuthHeaderFromCookies = (req: Request) => {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return;
  }

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return;
  }

  const path = req.originalUrl || "";

  if (path.startsWith("/api/auth/user/refresh-token")) {
    const token = getCookieValue(cookieHeader, REFRESH_TOKEN_USER_COOKIE);
    if (token) {
      req.headers.authorization = `Bearer ${token}`;
    }
    return;
  }

  if (path.startsWith("/api/auth/seller/refresh-token")) {
    const token = getCookieValue(cookieHeader, REFRESH_TOKEN_SELLER_COOKIE);
    if (token) {
      req.headers.authorization = `Bearer ${token}`;
    }
    return;
  }

  const preferSeller = SELLER_PATH_REGEX.test(path);
  const primaryCookie = preferSeller ? ACCESS_TOKEN_SELLER_COOKIE : ACCESS_TOKEN_USER_COOKIE;
  const fallbackCookie = preferSeller ? ACCESS_TOKEN_USER_COOKIE : ACCESS_TOKEN_SELLER_COOKIE;

  const token = getCookieValue(cookieHeader, primaryCookie) || getCookieValue(cookieHeader, fallbackCookie);

  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
};

const cookieAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  ensureAuthHeaderFromCookies(req);
  next();
};

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

app.use(cookieAuthMiddleware);
app.use(optionalAuthenticate);

// -------------------- Rate Limiter --------------------
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: (req: Request & { auth?: { userId: string } }) => (req.auth ? 1000 : 150),
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => ipKeyGenerator(req.ip),
});
app.use(limiter);

// -------------------- Health Check --------------------
app.get("/health", (req: Request, res: Response) => {
  res.send({
    message: `Welcome to ${serviceName}!`,
    requestId: req?.requestId,
  });
});

// -----------------------------------------------------------
// ⭐ PART 6: Forward Authorization Context + requestId
// -----------------------------------------------------------
const forwardHeaders = (req: Request, opts: any) => {
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

// -----------------------------------------------------------
// AUTH-SERVICE PROXY
// -----------------------------------------------------------
app.use(
  "/api/auth",
  proxy(AUTH_URL, {
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace("/api/auth", ""),

    proxyReqOptDecorator: (opts, req) => forwardHeaders(req, opts),

    proxyErrorHandler: (err, res) => {
      console.error("Auth Proxy Error:", err);
      res.status(502).json({ message: "Auth service unavailable" });
    },

    timeout: 15000,
    preserveHostHdr: true,
  })
);

// -----------------------------------------------------------
// PAYMENT-SERVICE PROXY
// -----------------------------------------------------------
app.use(
  "/api/payment",
  proxy(PAYMENT_URL, {
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace("/api/payment", ""),

    proxyReqOptDecorator: (opts, req) => forwardHeaders(req, opts),

    proxyErrorHandler: (err, res) => {
      console.error("Payment Proxy Error:", err);
      res.status(502).json({ message: "Payment service unavailable" });
    },

    timeout: 15000,
    preserveHostHdr: true,
  })
);

// -----------------------------------------------------------
// PRODUCT-SERVICE PROXY
// -----------------------------------------------------------
app.use(
  "/api/product",
  proxy(PRODUCT_URL, {
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace("/api/product", ""),

    proxyReqOptDecorator: (opts, req) => forwardHeaders(req, opts),

    proxyErrorHandler: (err, res) => {
      console.error("Product Proxy Error:", err);
      res.status(502).json({ message: "Product service unavailable" });
    },

    timeout: 15000,
    preserveHostHdr: true,
  })
);

// -------------------- Error Middleware --------------------
app.use(errorMiddleware(serviceName));

export default app;
