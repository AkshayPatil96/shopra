import { redisClient } from "../../cache/index.js";
import { CategoryOptionDTO } from "./category.types.js";

const CATEGORY_OPTIONS_KEY = "product-service:categories:options";
const CATEGORY_CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

export const getCategoryOptionsCache = async (): Promise<CategoryOptionDTO[] | null> => {
  const cached = await redisClient.get(CATEGORY_OPTIONS_KEY);
  return cached ? JSON.parse(cached) : null;
};

export const setCategoryOptionsCache = async (options: CategoryOptionDTO[]): Promise<void> => {
  await redisClient.set(CATEGORY_OPTIONS_KEY, JSON.stringify(options), "EX", CATEGORY_CACHE_TTL_SECONDS);
};

export const invalidateCategoryOptionsCache = async (): Promise<void> => {
  await redisClient.del(CATEGORY_OPTIONS_KEY);
};
