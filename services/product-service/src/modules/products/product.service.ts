import { ValidationError } from "@repo/error-handler";
import type {
  CreateProductDTO,
  UpdateProductDTO,
  ProductDetailDTO,
  ProductStatus,
  VariantDTO,
} from "@repo/shared-types";
import { PRODUCT_STATUS_VALUES } from "@repo/shared-types";
import type { Prisma } from "@repo/db-postgres";
import {
  createProductRecord,
  updateProductRecord,
  findProductById,
  findProducts,
  countProducts,
  findBrandById,
  findCategoryById,
} from "../../repositories/index.js";
import { toSlug } from "../../infra/index.js";
import {
  buildProductFilter,
  DEFAULT_PRODUCT_LIMIT,
  PRODUCT_OPTIONS_LIMIT,
  ProductListQuery,
  ProductListResult,
  mapProductSort,
  type ProductDetailEntity,
  type ProductListEntity,
  productDetailInclude,
  productListInclude,
  toProductDetailDTO,
  toProductListDTO,
  toProductOptionDTO,
} from "./product.types.js";
import {
  getProductOptionsCache,
  invalidateProductOptionsCache,
  setProductOptionsCache,
} from "./product.cache.js";

const DEFAULT_STATUS: ProductStatus = "ACTIVE";

const normalizeProductStatus = (status?: string | ProductStatus): ProductStatus => {
  if (!status) return DEFAULT_STATUS;
  const upper = status.toString().toUpperCase() as ProductStatus;
  return (PRODUCT_STATUS_VALUES as readonly string[]).includes(upper) ? upper : DEFAULT_STATUS;
};

const ensureShopId = (shopId?: string): string => {
  if (!shopId || !shopId.trim()) {
    throw new ValidationError("Shop ID is required");
  }
  return shopId.trim();
};

const ensureCategoryExists = async (categoryId?: string) => {
  if (!categoryId) {
    throw new ValidationError("Category ID is required");
  }

  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new ValidationError("Category not found");
  }
};

const ensureBrandExists = async (brandId?: string) => {
  if (!brandId) {
    return;
  }

  const brand = await findBrandById(brandId);

  if (!brand) {
    throw new ValidationError("Brand not found");
  }
};

const ensureProductForShop = async (id?: string, shopId?: string): Promise<ProductDetailEntity> => {
  if (!id) {
    throw new ValidationError("Product ID is required");
  }

  if (!shopId) {
    throw new ValidationError("Shop ID is required");
  }

  const product = await findProductById(id, productDetailInclude);

  if (!product || product.shopId !== shopId) {
    throw new ValidationError("Product not found");
  }

  return product as ProductDetailEntity;
};

const buildSlug = (slug: string | undefined, fallback: string): string => {
  const base = slug?.trim().length ? slug : fallback;
  const normalized = toSlug(base);
  if (normalized.length) {
    return normalized;
  }
  return `${toSlug(fallback)}-${Date.now()}`;
};

const sanitizeVariants = (variants?: VariantDTO[]): VariantDTO[] => {
  if (!variants || !variants.length) {
    throw new ValidationError("At least one variant is required");
  }

  return variants.map((variant) => ({
    ...variant,
    stock: typeof variant.stock === "number" && variant.stock > 0 ? Math.floor(variant.stock) : 0,
  }));
};

const aggregateVariantMetrics = (variants: VariantDTO[]) => {
  const totalStock = variants.reduce((sum, variant) => sum + (variant.stock ?? 0), 0);
  const priced = variants
    .filter((variant) => typeof variant.price === "number")
    .sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY));
  const reference = priced[0] ?? variants[0];

  return {
    price: reference?.price ?? null,
    compareAtPrice: reference?.compareAtPrice ?? null,
    stock: totalStock,
    inStock: totalStock > 0,
  } as const;
};

const toVariantCreateInput = (
  variant: VariantDTO,
  fallbackStatus: ProductStatus
): Prisma.ProductVariantCreateWithoutProductInput => ({
  sku: variant.sku ?? null,
  price: variant.price ?? null,
  compareAtPrice: variant.compareAtPrice ?? null,
  stock: variant.stock ?? 0,
  status: normalizeProductStatus(variant.status ?? fallbackStatus),
  attributes: variant.attributes ?? {},
});

export const createProductService = async (payload: CreateProductDTO): Promise<ProductDetailDTO> => {
  const shopId = ensureShopId(payload.shopId);
  await ensureCategoryExists(payload.categoryId);
  await ensureBrandExists(payload.brandId);

  const variants = sanitizeVariants(payload.variants);
  const status = normalizeProductStatus(payload.status);
  const slug = buildSlug(payload.slug, payload.title);
  const metrics = aggregateVariantMetrics(variants);
  const variantWrites = variants.map((variant) => toVariantCreateInput(variant, status));

  const result = await createProductRecord({
    data: {
      title: payload.title,
      slug,
      description: payload.description ?? null,
      summary: payload.summary ?? null,
      price: metrics.price,
      compareAtPrice: metrics.compareAtPrice,
      stock: metrics.stock,
      inStock: metrics.inStock,
      status,
      shopId,
      category: {
        connect: {
          id: payload.categoryId,
        },
      },
      brand: payload.brandId
        ? {
            connect: { id: payload.brandId },
          }
        : undefined,
      variants: {
        create: variantWrites,
      },
    },
    include: productDetailInclude.include,
  }) as ProductDetailEntity;

  await invalidateProductOptionsCache(shopId);
  return toProductDetailDTO(result);
};

const normalizePagination = (value: number | undefined, fallback: number) => {
  if (!value || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.floor(value);
};

const isDefaultStatus = (status?: ProductStatus | string) => {
  if (!status) return true;
  return normalizeProductStatus(status) === DEFAULT_STATUS;
};

export const listProductsService = async (query: ProductListQuery): Promise<ProductListResult> => {
  const shopId = ensureShopId(query.shopId);
  const page = normalizePagination(query.page, 1);
  const limit = normalizePagination(query.limit, DEFAULT_PRODUCT_LIMIT);
  const skip = (page - 1) * limit;
  const where = buildProductFilter({ ...query, shopId });
  const orderBy = mapProductSort(query.sort);

  if (query.select === "options") {
    if (!query.q && isDefaultStatus(query.status)) {
      const cached = await getProductOptionsCache(shopId);
      if (cached) {
        return { mode: "options", data: cached };
      }
    }

    const products = await findProducts({
      where,
      orderBy,
      take: PRODUCT_OPTIONS_LIMIT,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
      },
    });

    const options = products.map((product) => toProductOptionDTO(product));

    if (!query.q && isDefaultStatus(query.status)) {
      await setProductOptionsCache(shopId, options);
    }

    return { mode: "options", data: options };
  }

  const products = await findProducts({
    where,
    orderBy,
    skip,
    take: limit,
    include: productListInclude.include,
  }) as ProductListEntity[];

  const total = await countProducts({ where });
  const formatted = products.map((product) => toProductListDTO(product));

  return {
    mode: "list",
    data: formatted,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const getProductByIdService = async (id?: string, shopId?: string): Promise<ProductDetailDTO> => {
  const product = await ensureProductForShop(id, shopId);
  return toProductDetailDTO(product);
};

const buildVariantPayloadFromExisting = (product: ProductDetailEntity): VariantDTO[] => {
  if (!product.variants?.length) {
    return [];
  }

  return product.variants.map((variant: ProductDetailEntity["variants"][number]) => ({
    id: variant.id,
    sku: variant.sku ?? undefined,
    price: variant.price ?? undefined,
    compareAtPrice: variant.compareAtPrice ?? undefined,
    stock: typeof variant.stock === "number" ? variant.stock : 0,
    status: variant.status as ProductStatus,
    attributes: (variant.attributes as Record<string, unknown> | null) ?? undefined,
  }));
};

export const updateProductService = async (
  id: string | undefined,
  payload: UpdateProductDTO
): Promise<ProductDetailDTO> => {
  const product = await ensureProductForShop(id, payload.shopId);

  if (payload.categoryId && payload.categoryId !== product.categoryId) {
    await ensureCategoryExists(payload.categoryId);
  }

  if (typeof payload.brandId === "string" && payload.brandId !== product.brandId) {
    await ensureBrandExists(payload.brandId);
  }

  const variantsProvided = Array.isArray(payload.variants);
  const variantsSource = variantsProvided ? payload.variants : buildVariantPayloadFromExisting(product);
  const variants = sanitizeVariants(variantsSource);
  const status = normalizeProductStatus(payload.status ?? product.status);
  const slug = buildSlug(payload.slug, payload.title ?? product.title);
  const metrics = aggregateVariantMetrics(variants);

  const data: Prisma.ProductUpdateArgs["data"] = {
    title: payload.title ?? product.title,
    slug,
    description: typeof payload.description !== "undefined" ? payload.description : product.description,
    summary: typeof payload.summary !== "undefined" ? payload.summary : product.summary,
    price: metrics.price,
    compareAtPrice: metrics.compareAtPrice,
    stock: metrics.stock,
    inStock: metrics.inStock,
    status,
  };

  if (payload.categoryId) {
    data.category = { connect: { id: payload.categoryId } };
  }

  if (typeof payload.brandId === "string") {
    data.brand = payload.brandId
      ? { connect: { id: payload.brandId } }
      : { disconnect: true };
  }

  if (variantsProvided) {
    data.variants = {
      deleteMany: {},
      create: variants.map((variant) => toVariantCreateInput(variant, status)),
    };
  }

  const updated = await updateProductRecord({
    where: { id: product.id },
    data,
    include: productDetailInclude.include,
  }) as ProductDetailEntity;

  await invalidateProductOptionsCache(product.shopId);
  return toProductDetailDTO(updated);
};
