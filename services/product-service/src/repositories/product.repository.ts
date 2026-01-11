import { prisma, type Prisma } from "@repo/db-postgres";

type ProductCreateArgs = Prisma.ProductCreateArgs;
type ProductUpdateArgs = Prisma.ProductUpdateArgs;
type ProductFindManyArgs = Prisma.ProductFindManyArgs;
type ProductFindUniqueArgs = Prisma.ProductFindUniqueArgs;
type ProductCountArgs = Prisma.ProductCountArgs;
type ProductDeleteArgs = Prisma.ProductDeleteArgs;

type ProductRecord = Awaited<ReturnType<typeof prisma.product.create>>;
type ProductList = Awaited<ReturnType<typeof prisma.product.findMany>>;
type ProductDetail = Awaited<ReturnType<typeof prisma.product.findUnique>>;

type OptionalArgs<T> = T extends object ? Partial<Omit<T, "where">> : never;

export const createProductRecord = (args: ProductCreateArgs): Promise<ProductRecord> =>
  prisma.product.create(args);

export const updateProductRecord = (args: ProductUpdateArgs): Promise<ProductRecord> =>
  prisma.product.update(args);

export const deleteProductRecord = (args: ProductDeleteArgs) =>
  prisma.product.delete(args);

export const findProducts = (args?: ProductFindManyArgs): Promise<ProductList> =>
  prisma.product.findMany(args ?? {});

export const findProductById = (
  id: string,
  args?: OptionalArgs<ProductFindUniqueArgs>
): Promise<ProductDetail> =>
  prisma.product.findUnique({ where: { id }, ...(args ?? {}) });

export const countProducts = (args?: ProductCountArgs): Promise<number> =>
  prisma.product.count(args ?? {});
