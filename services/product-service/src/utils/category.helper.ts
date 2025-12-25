import prisma from "@repo/shared-db";

export async function buildFullSlug(categoryId: string): Promise<string> {
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
}

export async function updateCategoryTreeSlugs(categoryId: string) {
  // Update current category
  const fullSlug = await buildFullSlug(categoryId);
  await prisma.category.update({
    where: { id: categoryId },
    data: { fullSlug },
  });

  // Update children recursively
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });

  for (const child of children) {
    await updateCategoryTreeSlugs(child.id);
  }
}
