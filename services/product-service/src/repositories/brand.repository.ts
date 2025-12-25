import { prisma } from "@repo/db-postgres";

type BrandCreateData = Parameters<typeof prisma.brand.create>[0]["data"];
type BrandUpdateData = Parameters<typeof prisma.brand.update>[0]["data"];
type BrandFindManyArgs = Parameters<typeof prisma.brand.findMany>[0];
type BrandListResult = Awaited<ReturnType<typeof prisma.brand.findMany>>;
type BrandResult = Awaited<ReturnType<typeof prisma.brand.findUnique>>;

export const createBrandRecord = (data: BrandCreateData): Promise<Awaited<ReturnType<typeof prisma.brand.create>>> =>
  prisma.brand.create({ data });

export const findBrands = (args?: BrandFindManyArgs): Promise<BrandListResult> =>
  prisma.brand.findMany(args ?? {});

export const findBrandById = (id: string): Promise<BrandResult> =>
  prisma.brand.findUnique({ where: { id } });

export const updateBrandRecord = (id: string, data: BrandUpdateData): Promise<Awaited<ReturnType<typeof prisma.brand.update>>> =>
  prisma.brand.update({ where: { id }, data });

export const deleteBrandRecord = (id: string): Promise<Awaited<ReturnType<typeof prisma.brand.delete>>> =>
  prisma.brand.delete({ where: { id } });
