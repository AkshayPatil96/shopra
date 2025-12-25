import rateLimit, { Options, RateLimitRequestHandler } from 'express-rate-limit';

export const createRateLimiter = (options: Partial<Options> = {}): RateLimitRequestHandler =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
