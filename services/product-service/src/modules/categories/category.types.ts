import type { Prisma } from "@repo/db-postgres";
import type { Category as CategoryDTO } from "@repo/shared-types";
import type { findCategories, findCategoryById } from "../../repositories/index.js";

export type CategorySort =
  | "name_asc"
  | "name_desc"
  | "createdAt_asc"
  | "createdAt_desc"
  | "fullSlug_asc"
  | "fullSlug_desc"
  | "order_asc"
  | "order_desc";

export type CategoryStatusFilter = "active" | "inactive" | "all";

export interface CategoryListParams {
  q?: string;
  sort?: CategorySort;
  page: number;
  limit: number;
  select?: "options";
  status?: CategoryStatusFilter;
}

export interface CategoryOptionDTO {
  id: string;
  name: string;
}

export interface CategoryDetailDTO extends CategoryDTO {
  parent?: {
    id: string;
    name: string;
    slug: string;
    fullSlug: string;
  } | null;
  children?: Array<{
    id: string;
    name: string;
    fullSlug: string;
  }>;
  updatedAt?: string;
}

type CategoryCollection = Awaited<ReturnType<typeof findCategories>>;
export type CategoryEntity = CategoryCollection extends Array<infer U> ? U : never;
type CategoryBaseDetail = NonNullable<Awaited<ReturnType<typeof findCategoryById>>>;

type CategoryParentSnapshot = {
  id: string;
  name: string;
  slug?: string;
  fullSlug: string;
};

type CategoryChildSnapshot = {
  id: string;
  name: string;
  fullSlug: string;
};

type CategoryWithParent = CategoryEntity & {
  parent?: CategoryParentSnapshot | null;
};

type CategoryDetailEntity = CategoryBaseDetail & {
  parent?: CategoryParentSnapshot | null;
  children?: CategoryChildSnapshot[];
};

type CategorySortableFields = Prisma.CategoryOrderByWithRelationInput |
  Prisma.CategoryOrderByWithRelationInput[];

const DEFAULT_CATEGORY_SORT: CategorySortableFields = [
  { order: "asc" },
  { name: "asc" },
];

const categorySortMap: Record<CategorySort, CategorySortableFields> = {
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  createdAt_asc: { createdAt: "asc" },
  createdAt_desc: { createdAt: "desc" },
  fullSlug_asc: { fullSlug: "asc" },
  fullSlug_desc: { fullSlug: "desc" },
  order_asc: DEFAULT_CATEGORY_SORT,
  order_desc: [
    { order: "desc" },
    { name: "desc" },
  ],
};

export const DEFAULT_CATEGORY_LIMIT = 20;
export const CATEGORY_OPTIONS_LIMIT = 100;

const shouldFilterByStatus = (status?: CategoryStatusFilter): status is "active" | "inactive" =>
  status === "active" || status === "inactive";

export const buildCategoryFilter = (
  search?: string,
  status?: CategoryStatusFilter
): Record<string, unknown> => {
  const filters: Record<string, unknown>[] = [];

  if (shouldFilterByStatus(status)) {
    filters.push({ isActive: status === "active" });
  }

  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { fullSlug: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (!filters.length) {
    return {};
  }

  return filters.length === 1 ? filters[0]! : { AND: filters };
};

export const mapCategorySort = (sort?: CategorySort): CategorySortableFields =>
  sort ? categorySortMap[sort] : DEFAULT_CATEGORY_SORT;

const toIsoString = (value: Date | string | null | undefined) =>
  value instanceof Date ? value.toISOString() : value ?? undefined;

export const toCategoryListDTO = (category: CategoryWithParent): CategoryDTO => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  icon: category.icon ?? undefined,
  parentId: category.parentId,
  parentName: category?.parent?.name ?? null,
  createdAt: toIsoString(category.createdAt) ?? "",
  description: category.description ?? undefined,
  summary: category.summary ?? undefined,
  fullSlug: category.fullSlug ?? undefined,
  order: typeof category.order === "number" ? category.order : 0,
  isActive: category.isActive ?? true,
});

export const toCategoryDetailDTO = (category: CategoryDetailEntity): CategoryDetailDTO => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  icon: category.icon ?? undefined,
  parentId: category.parentId,
  parentName: category.parent?.name ?? null,
  createdAt: toIsoString(category.createdAt) ?? "",
  updatedAt: toIsoString(category.updatedAt),
  description: category.description ?? undefined,
  summary: category.summary ?? undefined,
  fullSlug: category.fullSlug ?? undefined,
  order: typeof category.order === "number" ? category.order : 0,
  isActive: category.isActive ?? true,
  parent: category.parent
    ? {
        id: category.parent.id,
        name: category.parent.name,
        slug: category.parent.slug ?? "",
        fullSlug: category.parent.fullSlug,
      }
    : null,
  children: category.children?.map((child) => ({
    id: child.id,
    name: child.name,
    fullSlug: child.fullSlug,
  })) ?? [],
});

export const toCategoryOptionDTO = (category: { id: string; name: string }): CategoryOptionDTO => ({
  id: category.id,
  name: category.name,
});
