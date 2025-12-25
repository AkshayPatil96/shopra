import { ValidationError } from "@repo/error-handler";
import { getStripeClient } from "../../infra/index.js";
import { findSellerById, updateSellerRecord } from "../../repositories/index.js";
import {
  getStripeConnectCache,
  invalidateStripeConnectCache,
  setStripeConnectCache,
} from "./stripeConnect.cache.js";
import type { StripeConnectResultDTO } from "./stripeConnect.types.js";

const getSellerFrontendUrl = () => process.env.SELLER_FRONTEND_URL || "http://localhost:8001";

const ensureSeller = async (sellerId: string) => {
  const seller = await findSellerById(sellerId);

  if (!seller) {
    throw new ValidationError("Seller not found");
  }

  return seller;
};

export const createStripeConnectSession = async (
  sellerId: string,
): Promise<StripeConnectResultDTO> => {
  if (!sellerId) {
    throw new ValidationError("Seller ID is required");
  }

  const cachedSession = await getStripeConnectCache(sellerId);
  if (cachedSession) {
    return { ...cachedSession, usedCache: true };
  }

  const seller = await ensureSeller(sellerId);

  if (seller.stripeId) {
    return {
      accountId: seller.stripeId,
      onboardingUrl: `${getSellerFrontendUrl()}/onboarding/success`,
      status: "connected",
      alreadyConnected: true,
    };
  }

  const stripe = getStripeClient();

  const account = await stripe.accounts.create({
    type: "express",
    email: seller.email || undefined,
    country: "US",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${getSellerFrontendUrl()}/onboarding/refresh`,
    return_url: `${getSellerFrontendUrl()}/onboarding/success`,
    type: "account_onboarding",
  });

  await updateSellerRecord(sellerId, { stripeId: account.id, status: "ACTIVE" } as any);
  await invalidateStripeConnectCache(sellerId);

  const session: StripeConnectResultDTO = {
    accountId: account.id,
    onboardingUrl: accountLink.url,
    status: "pending",
  };

  await setStripeConnectCache(sellerId, session);

  return session;
};
