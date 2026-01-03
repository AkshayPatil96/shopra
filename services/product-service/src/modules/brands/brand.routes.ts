import { Router } from "express";
import { createBrand, deleteBrand, getBrandById, getBrands, updateBrand } from "./brand.controller.js";
import { isAuthenticatedSeller, validateBody } from "@repo/shared-middleware";
import { CreateBrandSchema } from "@repo/shared-types";

const router: Router = Router();

router.post("/", isAuthenticatedSeller, validateBody(CreateBrandSchema), createBrand);
router.get("/", getBrands);
router.get("/:id", getBrandById);
router.put("/:id", isAuthenticatedSeller, validateBody(CreateBrandSchema), updateBrand);
router.delete("/:id", isAuthenticatedSeller, deleteBrand);

export default router;
