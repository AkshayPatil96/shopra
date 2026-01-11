import type { Brand as BrandDTO } from "@repo/shared-types";
import type { findBrandById, findBrands } from "../../repositories/index.js";

export type BrandSort =
  | "name_asc"
  | "name_desc"
  | "status_asc"
  | "status_desc"
  | "createdAt_asc"
  | "createdAt_desc";

export type BrandStatusFilter = "active" | "inactive" | "all";

export interface BrandListQuery {
  q?: string;
  sort?: BrandSort;
  select?: "options";
  status?: BrandStatusFilter;
}

export type BrandOptionDTO = {
  id: string;
  name: string;
};

type BrandEntity = NonNullable<Awaited<ReturnType<typeof findBrandById>>>;
type BrandCollection = Awaited<ReturnType<typeof findBrands>>;
type BrandListEntity = BrandCollection extends Array<infer U> ? U : never;

type BrandSortableFields = Record<string, "asc" | "desc"> | Array<Record<string, "asc" | "desc">>;

const brandSortMap: Record<BrandSort, BrandSortableFields> = {
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  status_asc: [{ isActive: "asc" }, { name: "asc" }],
  status_desc: [{ isActive: "desc" }, { name: "asc" }],
  createdAt_asc: { createdAt: "asc" },
  createdAt_desc: { createdAt: "desc" },
};

const shouldFilterByStatus = (status?: BrandStatusFilter): status is "active" | "inactive" =>
  status === "active" || status === "inactive";

export const buildBrandFilter = (
  search?: string,
  status?: BrandStatusFilter
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
      ],
    });
  }

  if (!filters.length) {
    return {};
  }

  return filters.length === 1 ? filters[0]! : { AND: filters };
};

export const mapBrandSort = (sort?: BrandSort): BrandSortableFields | undefined =>
  sort ? brandSortMap[sort] : undefined;

export const toBrandDTO = (brand: BrandEntity | BrandListEntity): BrandDTO => ({
  id: brand.id,
  name: brand.name,
  slug: brand.slug,
  logoUrl: brand.logoUrl ?? undefined,
  createdAt: brand.createdAt instanceof Date ? brand.createdAt.toISOString() : String(brand.createdAt),
  updatedAt: brand.updatedAt instanceof Date ? brand.updatedAt.toISOString() : String(brand.updatedAt),
  isActive: brand.isActive ?? true,
});

export const toBrandOptionDTO = (brand: { id: string; name: string }): BrandOptionDTO => ({
  id: brand.id,
  name: brand.name,
});
