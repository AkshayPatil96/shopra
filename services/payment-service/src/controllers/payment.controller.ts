import { asyncHandler } from "@repo/error-handler";
import prisma from "@repo/shared-db";
import { NextFunction, Request, RequestHandler, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-11-17.clover" });

export const connectStripeConnection: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const sellerId = req.auth?.userId;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const sellerData = await prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (sellerData?.stripeId) {
      return res.status(400).json({
        success: false,
        message: "Stripe account already connected.",
      });
    }

    // ⭐ Wrap Stripe calls here
    let account;
    try {
      account = await stripe.accounts.create({
        type: "express",
        email: sellerData?.email || undefined,
        country: "US",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      console.log("Stripe account created: ", account);
    } catch (err: any) {
      console.error("❌ Stripe create account ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Stripe account creation failed",
        error: err,
      });
    }
    console.log('account ==========>: ', account);

    let accountLink;
    try {
      accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.SELLER_FRONTEND_URL}/onboarding/refresh`,
        return_url: `${process.env.SELLER_FRONTEND_URL}/onboarding/success`,
        type: "account_onboarding",
      });
    } catch (err: any) {
      console.error("❌ Stripe account link ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Stripe account link creation failed",
        error: err,
      });
    }


    await prisma.seller.update({
      where: { id: sellerId },
      data: { stripeId: account.id, status: "ACTIVE" },
    });


    res.status(200).json({
      success: true,
      url: accountLink.url,
    });
  }
)