import { asyncHandler, ValidationError } from "@repo/error-handler";
import prisma from "@repo/shared-db";
import { CategoryFormDTO } from "@repo/shared-types/index";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { toSlug } from "../utils/utils.js";
import { updateCategoryTreeSlugs } from "../utils/category.helper.js";

export const createCategory: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body as CategoryFormDTO;

    const localSlug = toSlug(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug: localSlug,
        fullSlug: "",
        ...req.body,
      },
    });

    await updateCategoryTreeSlugs(category.id);

    const finalCategory = await prisma.category.findUnique({
      where: { id: category.id },
    });

    res.status(201).json({ message: "Category created successfully", data: finalCategory });
  })

export const getCategories: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      sort = "fullSlug_asc",
      q = "",
      page = "1",
      limit,
      select
    } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // 🔍 Search filter
    const filter: any = {};

    if (q && typeof q === "string") {
      filter.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { fullSlug: { contains: q, mode: "insensitive" } },
      ];
    }

    // 🔽 Sorting
    const allowedSort = {
      name_asc: { name: "asc" as const },
      name_desc: { name: "desc" as const },
      createdAt_asc: { createdAt: "asc" as const },
      createdAt_desc: { createdAt: "desc" as const },
      fullSlug_asc: { fullSlug: "asc" as const },
      fullSlug_desc: { fullSlug: "desc" as const },
    };

    const orderBy =
      allowedSort[sort as keyof typeof allowedSort] ||
      allowedSort["fullSlug_asc"];

    if (select === "options") {
      const categories = await prisma.category.findMany({
        where: filter,
        orderBy,
        select: {
          id: true,
          name: true,
        },
        take: 100,
      });

      return res.status(200).json({ status: "success", data: categories, message: "Category options fetched successfully" });
    }

    // 🗂 Fetch categories
    const categories = await prisma.category.findMany({
      where: filter,
      skip,
      take: limitNum,
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

    const total = await prisma.category.count({ where: filter });

    // 🛠 Format response
    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,          // local
      fullSlug: cat.fullSlug,  // hierarchical
      parentId: cat.parentId,
      parentName: cat?.parent?.name || null,
      parentSlug: cat?.parent?.fullSlug || null,
      createdAt: cat?.createdAt,
    }));

    return res.status(200).json({
      data: formatted,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  }
);

export const getCategoryById: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
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

    if (!category)
      return next(new ValidationError("Category not found"));

    return res.status(200).json({
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        fullSlug: category.fullSlug,
        summary: category.summary,
        description: category.description,
        parentId: category.parentId,
        parent: category.parent || null,
        children: category.children || [],
        createdAt: category.createdAt,
      },
    });
  }
);

export const updateCategory: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id;
    const { name, slug } = req.body as CategoryFormDTO;

    if (!categoryId)
      return next(new ValidationError("Category ID is required"));

    const localSlug = toSlug(name);

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return next(new ValidationError("Category not found"));
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { ...req.body, slug: localSlug },
    });

    await updateCategoryTreeSlugs(categoryId);

    res.status(200).json({ message: "Category updated successfully" });
  }
);

export const deleteCategory: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return next(new ValidationError("Category not found"));
    }

    // TODO: Check for associated products before deletion and handle accordingly
    const associatedProducts = await prisma.product.count({
      where: { categoryId },
    });

    if (associatedProducts > 0) {
      return next(new ValidationError("Cannot delete category with associated products"));
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.status(200).json({ message: "Category deleted successfully" });
  }
);
