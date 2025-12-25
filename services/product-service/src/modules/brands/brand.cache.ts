import { redisClient } from "../../cache/index.js";
import { BrandOptionDTO } from "./brand.types.js";

const BRAND_OPTIONS_KEY = "product-service:brands:options";
const BRAND_CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

export const getBrandOptionsCache = async (): Promise<BrandOptionDTO[] | null> => {
  const cached = await redisClient.get(BRAND_OPTIONS_KEY);
  return cached ? JSON.parse(cached) : null;
};

export const setBrandOptionsCache = async (options: BrandOptionDTO[]): Promise<void> => {
  await redisClient.set(BRAND_OPTIONS_KEY, JSON.stringify(options), "EX", BRAND_CACHE_TTL_SECONDS);
};

export const invalidateBrandOptionsCache = async (): Promise<void> => {
  await redisClient.del(BRAND_OPTIONS_KEY);
};
