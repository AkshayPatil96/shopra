import { redisClient } from "../../cache/index.js";
import type { ProductOptionDTO } from "./product.types.js";

const PRODUCT_CACHE_TTL_SECONDS = 5 * 60;
const buildOptionsKey = (shopId: string) => `product-service:shops:${shopId}:products:options`;

export const getProductOptionsCache = async (shopId?: string): Promise<ProductOptionDTO[] | null> => {
  if (!shopId) return null;
  const cached = await redisClient.get(buildOptionsKey(shopId));
  return cached ? JSON.parse(cached) : null;
};

export const setProductOptionsCache = async (shopId: string, options: ProductOptionDTO[]): Promise<void> => {
  if (!shopId) return;
  await redisClient.set(buildOptionsKey(shopId), JSON.stringify(options), "EX", PRODUCT_CACHE_TTL_SECONDS);
};

export const invalidateProductOptionsCache = async (shopId: string): Promise<void> => {
  if (!shopId) return;
  await redisClient.del(buildOptionsKey(shopId));
};
