import { ValidationError } from "@repo/error-handler";
import type { Brand as BrandDTO } from "@repo/shared-types";
import {
  createBrandRecord,
  deleteBrandRecord,
  findBrandById,
  findBrands,
  updateBrandRecord,
} from "../../repositories/index.js";
import {
  getBrandOptionsCache,
  invalidateBrandOptionsCache,
  setBrandOptionsCache,
} from "./brand.cache.js";
import {
  BrandListQuery,
  BrandOptionDTO,
  buildBrandFilter,
  mapBrandSort,
  toBrandDTO,
  toBrandOptionDTO,
} from "./brand.types.js";

type BrandCreateInput = Parameters<typeof createBrandRecord>[0];
type BrandUpdateInput = Parameters<typeof updateBrandRecord>[1];

type BrandListResult =
  | { mode: "options"; data: BrandOptionDTO[] }
  | { mode: "list"; data: BrandDTO[] };

const BRAND_OPTIONS_LIMIT = 100;

const ensureBrandExists = async (id?: string) => {
  if (!id) {
    throw new ValidationError("Brand ID is required");
  }

  const brand = await findBrandById(id);

  if (!brand) {
    throw new ValidationError("Brand not found");
  }

  return brand;
};

export const createBrandService = async (payload: BrandCreateInput): Promise<BrandDTO> => {
  const brand = await createBrandRecord(payload);
  await invalidateBrandOptionsCache();
  return toBrandDTO(brand);
};

export const listBrandsService = async (query: BrandListQuery): Promise<BrandListResult> => {
  const where = buildBrandFilter(query.q);
  const orderBy = mapBrandSort(query.sort);

  if (query.select === "options") {
    if (!query.q) {
      const cached = await getBrandOptionsCache();
      if (cached) {
        return { mode: "options", data: cached };
      }
    }

    const optionRecords = await findBrands({
      where,
      orderBy,
      select: { id: true, name: true },
      take: BRAND_OPTIONS_LIMIT,
    });

    const options = optionRecords.map((option) => toBrandOptionDTO(option));

    if (!query.q) {
      await setBrandOptionsCache(options);
    }

    return { mode: "options", data: options };
  }

  const brands = await findBrands({ where, orderBy });
  const formatted = brands.map((brand) => toBrandDTO(brand));

  return { mode: "list", data: formatted };
};

export const getBrandByIdService = async (id?: string): Promise<BrandDTO> => {
  const brand = await ensureBrandExists(id);
  return toBrandDTO(brand);
};

export const updateBrandService = async (id: string | undefined, payload: BrandUpdateInput): Promise<BrandDTO> => {
  await ensureBrandExists(id);
  const updated = await updateBrandRecord(id!, payload);
  await invalidateBrandOptionsCache();
  return toBrandDTO(updated);
};

export const deleteBrandService = async (id?: string): Promise<void> => {
  await ensureBrandExists(id);
  await deleteBrandRecord(id!);
  await invalidateBrandOptionsCache();
};
