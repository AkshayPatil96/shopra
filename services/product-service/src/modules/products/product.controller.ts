import { asyncHandler, ValidationError } from "@repo/error-handler";
import type { Request, RequestHandler, Response } from "express";
import {
  createProductService,
  getProductByIdService,
  listProductsService,
  updateProductService,
} from "./product.service.js";
import {
  DEFAULT_PRODUCT_LIMIT,
  ProductListQuery,
} from "./product.types.js";
import { PRODUCT_STATUS_VALUES } from "@repo/shared-types";

const SHOP_ID_HEADER = "x-shop-id";

const toNumber = (value: unknown): number | undefined => {
  if (Array.isArray(value)) {
    return toNumber(value[0]);
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toStringValue = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim().length) {
    return value.trim();
  }

  return undefined;
};

const resolveShopId = (req: Request, preferred?: unknown): string | undefined => {
  if (typeof preferred === "string" && preferred.trim().length) {
    return preferred.trim();
  }

  if (typeof req.body?.shopId === "string" && req.body.shopId.trim().length) {
    return req.body.shopId.trim();
  }

  if (typeof req.query.shopId === "string" && req.query.shopId.trim().length) {
    return req.query.shopId.trim();
  }

  const headerValue = req.headers[SHOP_ID_HEADER];
  if (typeof headerValue === "string" && headerValue.trim().length) {
    return headerValue.trim();
  }

  return undefined;
};

const parseStatus = (value: unknown): ProductListQuery["status"] => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();

  if (normalized === "ALL") {
    return "all";
  }

  return (PRODUCT_STATUS_VALUES as readonly string[]).includes(normalized)
    ? (normalized as ProductListQuery["status"])
    : undefined;
};

const parseProductQuery = (req: Request): ProductListQuery => ({
  shopId: resolveShopId(req, req.query.shopId) ?? "",
  q: typeof req.query.q === "string" ? req.query.q : undefined,
  sort: typeof req.query.sort === "string" ? (req.query.sort as ProductListQuery["sort"]) : undefined,
  page: toNumber(req.query.page) ?? 1,
  limit: toNumber(req.query.limit) ?? DEFAULT_PRODUCT_LIMIT,
  status: parseStatus(req.query.status),
  categoryId: toStringValue(req.query.categoryId),
  brandId: toStringValue(req.query.brandId),
  select: req.query.select === "options" ? "options" : undefined,
});

const ensureShopId = (shopId?: string): string => {
  if (!shopId) {
    throw new ValidationError("Shop ID is required");
  }

  return shopId;
};

export const createProduct: RequestHandler = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const shopId = resolveShopId(req, req.body?.shopId);
  const payload = { ...req.body, shopId };
  const product = await createProductService(payload);

  res.status(201).json({
    status: "success",
    data: product,
    message: "Product created successfully",
  });
});

export const getProducts: RequestHandler = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const query = parseProductQuery(req);
  const result = await listProductsService(query);

  if (result.mode === "options") {
    return res.status(200).json({
      status: "success",
      data: result.data,
      message: "Product options fetched successfully",
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
});

export const getProductById: RequestHandler = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const shopId = ensureShopId(resolveShopId(req, req.query.shopId));
  const product = await getProductByIdService(req.params.id, shopId);

  res.status(200).json({
    status: "success",
    data: product,
  });
});

export const updateProduct: RequestHandler = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const shopId = resolveShopId(req, req.body?.shopId);
  const payload = { ...req.body, shopId };
  const product = await updateProductService(req.params.id, payload);

  res.status(200).json({
    status: "success",
    data: product,
    message: "Product updated successfully",
  });
});
