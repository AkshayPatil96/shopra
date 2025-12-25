import { Router } from "express";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "./category.controller.js";
import { isAuthenticatedSeller, validateBody } from "@repo/shared-middleware";
import { CategoryFormSchema } from "@repo/shared-types";

const router: Router = Router();

router.post("/", isAuthenticatedSeller, validateBody(CategoryFormSchema), createCategory);
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", isAuthenticatedSeller, validateBody(CategoryFormSchema), updateCategory);
router.delete("/:id", isAuthenticatedSeller, deleteCategory);

export default router;
