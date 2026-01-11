import { Router } from "express";
import { isAuthenticatedSeller, validateBody } from "@repo/shared-middleware";
import { CreateProductZ, UpdateProductZ } from "@repo/shared-types";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "./product.controller.js";

const router: Router = Router();

router.post("/", isAuthenticatedSeller, validateBody(CreateProductZ), createProduct);
router.get("/", isAuthenticatedSeller, getProducts);
router.get("/:id", isAuthenticatedSeller, getProductById);
router.put("/:id", isAuthenticatedSeller, validateBody(UpdateProductZ), updateProduct);

export default router;
