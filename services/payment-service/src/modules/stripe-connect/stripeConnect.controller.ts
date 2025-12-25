import { asyncHandler } from "@repo/error-handler";
import { type RequestHandler, Request, Response } from "express";
import { createStripeConnectSession } from "./stripeConnect.service.js";

export const connectStripeAccount: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const sellerId = req.auth?.userId;

  if (!sellerId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await createStripeConnectSession(sellerId);

  res.status(200).json({
    success: true,
    data: result,
    message: result.alreadyConnected
      ? "Stripe account already connected."
      : "Stripe onboarding link created successfully.",
  });
});
