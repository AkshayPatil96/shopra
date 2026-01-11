import type { Prisma } from "@repo/db-postgres";
import type {
  ProductStatus,
  ProductDTO,
  ProductDetailDTO,
  ProductVariantDTO,
} from "@repo/shared-types";

export type ProductSort =
  | "createdAt_asc"
  | "createdAt_desc"
  | "title_asc"
  | "title_desc"
  | "status_asc"
  | "status_desc"
  | "stock_desc"
  | "stock_asc";

export type ProductStatusFilter = ProductStatus | "all" | undefined;

export interface ProductListQuery {
  shopId: string;
  q?: string;
  sort?: ProductSort;
  page: number;
  limit: number;
  status?: ProductStatusFilter;
  categoryId?: string;
  brandId?: string;
  select?: "options";
}

export interface ProductOptionDTO {
  id: string;
  title: string;
  slug: string;
  status: ProductStatus;
}

export type ProductListResult =
  | { mode: "options"; data: ProductOptionDTO[] }
  | { mode: "list"; data: ProductDTO[]; page: number; limit: number; total: number; totalPages: number };

export const DEFAULT_PRODUCT_LIMIT = 20;
export const PRODUCT_OPTIONS_LIMIT = 100;

const DEFAULT_PRODUCT_SORT: Prisma.ProductOrderByWithRelationInput[] = [
  { createdAt: "desc" },
];

const productSortMap: Record<ProductSort, Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[]> = {
  createdAt_asc: { createdAt: "asc" },
  createdAt_desc: { createdAt: "desc" },
  title_asc: { title: "asc" },
  title_desc: { title: "desc" },
  status_asc: [{ status: "asc" }, { title: "asc" }],
  status_desc: [{ status: "desc" }, { title: "asc" }],
  stock_desc: [{ stock: "desc" }, { title: "asc" }],
  stock_asc: [{ stock: "asc" }, { title: "asc" }],
};

type ProductWhereInput = Prisma.ProductWhereInput;

type SortableFields = Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];

const toIsoString = (value: Date | string | null | undefined): string =>
  value instanceof Date ? value.toISOString() : typeof value === "string" ? value : "";

const normalizeBoolean = (value: boolean | null | undefined, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

export const productListInclude = {
  include: {
    category: {
      select: {
        id: true,
        name: true,
      },
    },
    brand: {
      select: {
        id: true,
        name: true,
      },
    },
  },
} as const;

export const productDetailInclude = {
  include: {
    ...productListInclude.include,
    variants: {
      orderBy: { createdAt: "asc" },
    },
  },
} as const;

export type ProductListEntity = Prisma.ProductGetPayload<typeof productListInclude>;
export type ProductDetailEntity = Prisma.ProductGetPayload<typeof productDetailInclude>;

const shouldFilterByStatus = (status?: ProductStatusFilter): status is ProductStatus =>
  typeof status === "string" && status.toLowerCase() !== "all";

export const buildProductFilter = (query: ProductListQuery): ProductWhereInput => {
  const filters: ProductWhereInput[] = [{ shopId: query.shopId }];

  if (query.categoryId) {
    filters.push({ categoryId: query.categoryId });
  }

  if (typeof query.brandId === "string" && query.brandId.length > 0) {
    filters.push({ brandId: query.brandId });
  }

  if (shouldFilterByStatus(query.status)) {
    filters.push({ status: query.status });
  }

  if (query.q) {
    const search = query.q.trim();
    if (search.length) {
      filters.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
          { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
        ],
      });
    }
  }

  if (filters.length === 1) {
    return filters[0]!;
  }

  return { AND: filters };
};

export const mapProductSort = (sort?: ProductSort): SortableFields =>
  sort ? productSortMap[sort] ?? DEFAULT_PRODUCT_SORT : DEFAULT_PRODUCT_SORT;

export const toProductListDTO = (product: ProductListEntity): ProductDTO => ({
  id: product.id,
  title: product.title,
  slug: product.slug,
  description: product.description,
  summary: product.summary,
  price: product.price ?? undefined,
  compareAtPrice: product.compareAtPrice ?? undefined,
  stock: typeof product.stock === "number" ? product.stock : 0,
  inStock: normalizeBoolean(product.inStock, (product.stock ?? 0) > 0),
  status: product.status as ProductStatus,
  shopId: product.shopId,
  categoryId: product.categoryId,
  categoryName: product.category?.name ?? null,
  brandId: product.brandId ?? undefined,
  brandName: product.brand?.name ?? null,
  createdAt: toIsoString(product.createdAt),
  updatedAt: toIsoString(product.updatedAt),
});

const toProductVariantDTO = (variant: ProductDetailEntity["variants"][number]): ProductVariantDTO => ({
  id: variant.id,
  sku: variant.sku ?? null,
  price: variant.price ?? null,
  compareAtPrice: variant.compareAtPrice ?? null,
  stock: typeof variant.stock === "number" ? variant.stock : 0,
  status: variant.status as ProductStatus,
  attributes: (variant.attributes as Record<string, unknown> | null) ?? null,
  createdAt: toIsoString(variant.createdAt),
  updatedAt: toIsoString(variant.updatedAt),
});

export const toProductDetailDTO = (product: ProductDetailEntity): ProductDetailDTO => ({
  ...toProductListDTO(product),
  variants: product.variants?.map(toProductVariantDTO) ?? [],
});

export const toProductOptionDTO = (product: { id: string; title: string; slug: string; status: string }): ProductOptionDTO => ({
  id: product.id,
  title: product.title,
  slug: product.slug,
  status: product.status as ProductStatus,
});
