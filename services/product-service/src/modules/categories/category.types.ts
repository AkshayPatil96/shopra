import type { Category as CategoryDTO } from "@repo/shared-types";
import type { findCategories, findCategoryById } from "../../repositories/index.js";

export type CategorySort =
  | "name_asc"
  | "name_desc"
  | "createdAt_asc"
  | "createdAt_desc"
  | "fullSlug_asc"
  | "fullSlug_desc";

export interface CategoryListParams {
  q?: string;
  sort?: CategorySort;
  page: number;
  limit: number;
  select?: "options";
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

type CategorySortableFields = Record<string, "asc" | "desc">;

const categorySortMap: Record<CategorySort, CategorySortableFields> = {
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  createdAt_asc: { createdAt: "asc" },
  createdAt_desc: { createdAt: "desc" },
  fullSlug_asc: { fullSlug: "asc" },
  fullSlug_desc: { fullSlug: "desc" },
};

export const DEFAULT_CATEGORY_LIMIT = 20;
export const CATEGORY_OPTIONS_LIMIT = 100;

export const buildCategoryFilter = (search?: string): Record<string, unknown> => {
  if (!search) return {};

  return {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { fullSlug: { contains: search, mode: "insensitive" } },
    ],
  };
};

export const mapCategorySort = (sort?: CategorySort): CategorySortableFields =>
  sort ? categorySortMap[sort] : categorySortMap.fullSlug_asc;

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
