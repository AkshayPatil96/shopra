import { redisClient } from "../../cache/index.js";
import type { StripeConnectResultDTO } from "./stripeConnect.types.js";

const STRIPE_CONNECT_CACHE_PREFIX = "payment-service:stripe-connect:";
const STRIPE_CONNECT_TTL_SECONDS = 5 * 60; // cache onboarding links for 5 minutes

const buildCacheKey = (sellerId: string) => `${STRIPE_CONNECT_CACHE_PREFIX}${sellerId}`;

export const getStripeConnectCache = async (
  sellerId: string,
): Promise<StripeConnectResultDTO | null> => {
  const result = await redisClient.get(buildCacheKey(sellerId));
  return result ? JSON.parse(result) : null;
};

export const setStripeConnectCache = async (
  sellerId: string,
  payload: StripeConnectResultDTO,
): Promise<void> => {
  await redisClient.set(
    buildCacheKey(sellerId),
    JSON.stringify(payload),
    "EX",
    STRIPE_CONNECT_TTL_SECONDS,
  );
};

export const invalidateStripeConnectCache = async (sellerId: string): Promise<void> => {
  await redisClient.del(buildCacheKey(sellerId));
};
