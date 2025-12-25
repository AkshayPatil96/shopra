import { asyncHandler } from "@repo/error-handler";
import { Request, RequestHandler, Response } from "express";
import {
  createCategoryService,
  deleteCategoryService,
  getCategoryByIdService,
  listCategoriesService,
  updateCategoryService,
} from "./category.service.js";
import { CategoryListParams, DEFAULT_CATEGORY_LIMIT } from "./category.types.js";

const toNumber = (value: unknown): number | undefined => {
  if (Array.isArray(value)) {
    const parsed = Number(value[0]);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return undefined;
};

const parseCategoryQuery = (query: Request["query"]): CategoryListParams => ({
  q: typeof query.q === "string" ? query.q : undefined,
  sort: typeof query.sort === "string" ? (query.sort as CategoryListParams["sort"]) : undefined,
  page: toNumber(query.page) ?? 1,
  limit: toNumber(query.limit) ?? DEFAULT_CATEGORY_LIMIT,
  select: query.select === "options" ? "options" : undefined,
});

export const createCategory: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await createCategoryService(req.body);

    res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  }
);

export const getCategories: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const query = parseCategoryQuery(req.query);
    const result = await listCategoriesService(query);

    if (result.mode === "options") {
      return res.status(200).json({
        status: "success",
        data: result.data,
        message: "Category options fetched successfully",
      });
    }

    return res.status(200).json({
      status: "success",
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  }
);

export const getCategoryById: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await getCategoryByIdService(req.params.id);

    return res.status(200).json({
      data: category,
    });
  }
);

export const updateCategory: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    await updateCategoryService(req.params.id, req.body);

    res.status(200).json({ message: "Category updated successfully" });
  }
);

export const deleteCategory: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteCategoryService(req.params.id);

    res.status(200).json({ message: "Category deleted successfully" });
  }
);
