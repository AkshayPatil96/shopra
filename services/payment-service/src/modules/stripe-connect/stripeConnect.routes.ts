import { Router } from "express";
import { isAuthenticatedSeller } from "@repo/shared-middleware";
import { connectStripeAccount } from "./stripeConnect.controller.js";

const router: Router = Router();

router.post(
  "/connect",
  isAuthenticatedSeller,
  /* #swagger.tags = ['Stripe Connect'] */
  /* #swagger.description = 'Create or resume a Stripe Connect onboarding session for the authenticated seller.' */
  connectStripeAccount,
);

router.post("/connect-stripe", isAuthenticatedSeller, connectStripeAccount);

export default router;
