import dotenv from "dotenv";
dotenv.config();
import { getRedis } from '@repo/db-redis';

export const redisClient = getRedis();
