import { Router } from "express"
import { connectStripeConnection } from "../controllers/payment.controller.js";
import { isAuthenticatedSeller } from "@repo/shared-middleware";

const router: Router = Router();

router.post("/connect-stripe", isAuthenticatedSeller, connectStripeConnection);

export default router;