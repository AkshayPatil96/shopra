import { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "@repo/error-handler";
import {
  createBrandService,
  deleteBrandService,
  getBrandByIdService,
  listBrandsService,
  updateBrandService,
} from "./brand.service.js";
import type { BrandListQuery } from "./brand.types.js";

const parseBrandQuery = (query: Request["query"]): BrandListQuery => ({
  q: typeof query.q === "string" ? query.q : undefined,
  sort: typeof query.sort === "string" ? (query.sort as BrandListQuery["sort"]) : undefined,
  select: query.select === "options" ? "options" : undefined,
});

// CREATE
export const createBrand: RequestHandler = asyncHandler(async (
  req: Request, res: Response
) => {
  const brand = await createBrandService(req.body);

  res.status(201).json({
    status: "success",
    data: brand,
    message: "Brand created successfully",
  });
});

// GET ALL (supports q, sort)
export const getBrands: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = parseBrandQuery(req.query);
  const result = await listBrandsService(query);
  const message = result.mode === "options"
    ? "Brand options fetched successfully"
    : "Brands fetched successfully";

  res.status(200).json({
    status: "success",
    data: result.data,
    message,
  });
});

// GET BY ID
export const getBrandById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const brand = await getBrandByIdService(req.params.id);

  res.status(200).json({
    status: "success",
    data: brand,
    message: "Brand fetched successfully",
  });
});

// UPDATE
export const updateBrand: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const updated = await updateBrandService(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data: updated,
    message: "Brand updated successfully",
  });
});

// DELETE
export const deleteBrand: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await deleteBrandService(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Brand deleted successfully",
  });
});
