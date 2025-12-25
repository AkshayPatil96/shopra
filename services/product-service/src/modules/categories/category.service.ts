import { ValidationError } from "@repo/error-handler";
import type { Category as CategoryDTO, CategoryFormDTO } from "@repo/shared-types";
import {
  countCategories,
  countProductsByCategory,
  createCategoryRecord,
  deleteCategoryRecord,
  findCategories,
  findCategoryById,
  updateCategoryRecord,
  updateCategoryTreeSlugs,
} from "../../repositories/index.js";
import { toSlug } from "../../infra/index.js";
import {
  CATEGORY_OPTIONS_LIMIT,
  CategoryDetailDTO,
  CategoryListParams,
  CategoryOptionDTO,
  buildCategoryFilter,
  mapCategorySort,
  toCategoryDetailDTO,
  toCategoryListDTO,
  toCategoryOptionDTO,
  DEFAULT_CATEGORY_LIMIT,
} from "./category.types.js";
import {
  getCategoryOptionsCache,
  invalidateCategoryOptionsCache,
  setCategoryOptionsCache,
} from "./category.cache.js";

const ensureCategoryExists = async (id?: string) => {
  if (!id) {
    throw new ValidationError("Category ID is required");
  }

  const category = await findCategoryById(id, {
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          fullSlug: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          fullSlug: true,
        },
      },
    },
  });

  if (!category) {
    throw new ValidationError("Category not found");
  }

  return category;
};

type CategoryListResult =
  | { mode: "options"; data: CategoryOptionDTO[] }
  | { mode: "list"; data: CategoryDTO[]; page: number; limit: number; total: number; totalPages: number };

const normalizePagination = (value: number | undefined, fallback: number) =>
  Number.isFinite(value) && value && value > 0 ? Math.floor(value) : fallback;

const baseDetailInclude = {
  include: {
    parent: {
      select: {
        id: true,
        name: true,
        slug: true,
        fullSlug: true,
      },
    },
    children: {
      select: {
        id: true,
        name: true,
        fullSlug: true,
      },
    },
  },
} as const;

export const createCategoryService = async (payload: CategoryFormDTO): Promise<CategoryDetailDTO> => {
  const localSlug = toSlug(payload.name);

  const category = await createCategoryRecord({
    ...payload,
    name: payload.name,
    slug: localSlug,
    fullSlug: "",
  });

  await updateCategoryTreeSlugs(category.id);
  await invalidateCategoryOptionsCache();

  const finalCategory = await findCategoryById(category.id, baseDetailInclude);

  if (!finalCategory) {
    throw new ValidationError("Unable to load category after creation");
  }

  return toCategoryDetailDTO(finalCategory);
};

export const listCategoriesService = async (params: CategoryListParams): Promise<CategoryListResult> => {
  const page = normalizePagination(params.page, 1);
  const limit = normalizePagination(params.limit, DEFAULT_CATEGORY_LIMIT);
  const skip = (page - 1) * limit;
  const where = buildCategoryFilter(params.q);
  const orderBy = mapCategorySort(params.sort);

  if (params.select === "options") {
    if (!params.q) {
      const cached = await getCategoryOptionsCache();
      if (cached) {
        return { mode: "options", data: cached };
      }
    }

    const categories = await findCategories({
      where,
      orderBy,
      select: { id: true, name: true },
      take: CATEGORY_OPTIONS_LIMIT,
    });

    const options = categories.map((category) => toCategoryOptionDTO(category));

    if (!params.q) {
      await setCategoryOptionsCache(options);
    }

    return { mode: "options", data: options };
  }

  const categories = await findCategories({
    where,
    skip,
    take: limit,
    orderBy,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          fullSlug: true,
        },
      },
    },
  });

  const total = await countCategories({ where });
  const formatted = categories.map((category) => toCategoryListDTO(category));

  return {
    mode: "list",
    data: formatted,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const getCategoryByIdService = async (id?: string): Promise<CategoryDetailDTO> => {
  const category = await ensureCategoryExists(id);
  return toCategoryDetailDTO(category);
};

export const updateCategoryService = async (
  id: string | undefined,
  payload: CategoryFormDTO
): Promise<void> => {
  const category = await ensureCategoryExists(id);
  const localSlug = toSlug(payload.name);

  await updateCategoryRecord(id!, { ...payload, slug: localSlug });
  await updateCategoryTreeSlugs(category.id);
  await invalidateCategoryOptionsCache();
};

export const deleteCategoryService = async (id?: string): Promise<void> => {
  const category = await ensureCategoryExists(id);
  const associatedProducts = await countProductsByCategory(category.id);

  if (associatedProducts > 0) {
    throw new ValidationError("Cannot delete category with associated products");
  }

  await deleteCategoryRecord(category.id);
  await invalidateCategoryOptionsCache();
};
