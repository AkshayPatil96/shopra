import type { Brand as BrandDTO } from "@repo/shared-types";
import type { findBrandById, findBrands } from "../../repositories/index.js";

export type BrandSort = "name_asc" | "name_desc" | "createdAt_asc" | "createdAt_desc";

export interface BrandListQuery {
  q?: string;
  sort?: BrandSort;
  select?: "options";
}

export type BrandOptionDTO = {
  id: string;
  name: string;
};

type BrandEntity = NonNullable<Awaited<ReturnType<typeof findBrandById>>>;
type BrandCollection = Awaited<ReturnType<typeof findBrands>>;
type BrandListEntity = BrandCollection extends Array<infer U> ? U : never;

type BrandSortableFields = Record<string, "asc" | "desc">;

const brandSortMap: Record<BrandSort, BrandSortableFields> = {
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
  createdAt_asc: { createdAt: "asc" },
  createdAt_desc: { createdAt: "desc" },
};

export const buildBrandFilter = (search?: string): Record<string, unknown> => {
  if (!search) return {};

  return {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ],
  };
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
});

export const toBrandOptionDTO = (brand: { id: string; name: string }): BrandOptionDTO => ({
  id: brand.id,
  name: brand.name,
});
