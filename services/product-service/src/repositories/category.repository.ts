import { prisma } from "@repo/db-postgres";

type CategoryCreateData = Parameters<typeof prisma.category.create>[0]["data"];
type CategoryUpdateData = Parameters<typeof prisma.category.update>[0]["data"];
type CategoryFindManyArgs = Parameters<typeof prisma.category.findMany>[0];
type CategoryCountArgs = Parameters<typeof prisma.category.count>[0];
type CategoryFindUniqueArgs = Parameters<typeof prisma.category.findUnique>[0];
type CategoryListResult = Awaited<ReturnType<typeof prisma.category.findMany>>;
type CategoryResult = Awaited<ReturnType<typeof prisma.category.findUnique>>;
type CategoryCreateResult = Awaited<ReturnType<typeof prisma.category.create>>;
type CategoryUpdateResult = Awaited<ReturnType<typeof prisma.category.update>>;
type CategoryDeleteResult = Awaited<ReturnType<typeof prisma.category.delete>>;
type CategoryCountResult = Awaited<ReturnType<typeof prisma.category.count>>;
type ProductCountResult = Awaited<ReturnType<typeof prisma.product.count>>;

export const createCategoryRecord = (data: CategoryCreateData): Promise<CategoryCreateResult> =>
  prisma.category.create({ data });

export const findCategories = (args?: CategoryFindManyArgs): Promise<CategoryListResult> =>
  prisma.category.findMany(args ?? {});

export const findCategoryById = (
  id: string,
  args?: Partial<Omit<CategoryFindUniqueArgs, "where">>
): Promise<CategoryResult> =>
  prisma.category.findUnique({ where: { id }, ...(args ?? {}) });

export const updateCategoryRecord = (
  id: string,
  data: CategoryUpdateData
): Promise<CategoryUpdateResult> =>
  prisma.category.update({ where: { id }, data });

export const deleteCategoryRecord = (id: string): Promise<CategoryDeleteResult> =>
  prisma.category.delete({ where: { id } });

export const countCategories = (args?: CategoryCountArgs): Promise<CategoryCountResult> =>
  prisma.category.count(args ?? {});

export const countProductsByCategory = (categoryId: string): Promise<ProductCountResult> =>
  prisma.product.count({ where: { categoryId } });

const buildFullSlug = async (categoryId: string): Promise<string> => {
  const parts: string[] = [];

  let current = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { slug: true, parentId: true },
  });

  while (current) {
    parts.unshift(current.slug);
    current = current.parentId
      ? await prisma.category.findUnique({
          where: { id: current.parentId },
          select: { slug: true, parentId: true },
        })
      : null;
  }

  return parts.join("/");
};

export const updateCategoryTreeSlugs = async (categoryId: string): Promise<void> => {
  const fullSlug = await buildFullSlug(categoryId);
  await prisma.category.update({
    where: { id: categoryId },
    data: { fullSlug },
  });

  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });

  for (const child of children) {
    await updateCategoryTreeSlugs(child.id);
  }
};
