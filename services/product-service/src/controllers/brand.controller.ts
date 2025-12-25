import { NextFunction, Request, RequestHandler, Response } from "express";
import { asyncHandler, ValidationError } from "@repo/error-handler";
import prisma from "@repo/shared-db";

// CREATE
export const createBrand: RequestHandler = asyncHandler(async (
  req: Request, res: Response, next: NextFunction
) => {

  const brand = await prisma.brand.create({
    data: req.body,
  });

  res.status(201).json({
    status: "success",
    data: brand,
    message: "Brand created successfully",
  });
});

// GET ALL (supports q, sort)
export const getBrands: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { q, sort, select } = req.query;

  let filter: any = {};
  let sortFilter: any = {};

  if (q && typeof q === "string") {
    filter.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  if (sort === "name_asc") sortFilter.name = "asc";
  if (sort === "name_desc") sortFilter.name = "desc";
  if (sort === "createdAt_asc") sortFilter.createdAt = "asc";
  if (sort === "createdAt_desc") sortFilter.createdAt = "desc";

  if (select === "options") {
    const brands = await prisma.brand.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
      },
      take: 100,
    });

    return res.status(200).json({
      status: "success",
      data: brands,
      message: "Brand options fetched successfully",
    });
  }

  const brands = await prisma.brand.findMany({
    where: filter,
    orderBy: sortFilter,
  });

  res.json({
    status: "success",
    data: brands,
    message: "Brands fetched successfully",
  });
});

// GET BY ID
export const getBrandById: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    next(new ValidationError("Brand ID is required"));
  }

  const brand = await prisma.brand.findUnique({
    where: { id },
  });

  if (!brand) {
    next(new ValidationError("Brand not found"));
  }

  res.status(200).json({
    status: "success",
    data: brand,
    message: "Brand fetched successfully",
  });
});

// UPDATE
export const updateBrand: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    next(new ValidationError("Brand ID is required"));
  }

  const brand = await prisma.brand.findUnique({
    where: { id },
  });

  if (!brand) {
    next(new ValidationError("Brand not found"));
  }

  const updated = await prisma.brand.update({
    where: { id },
    data: req.body,
  });

  res.status(200).json({
    status: "success",
    data: updated,
    message: "Brand updated successfully",
  });
});

// DELETE
export const deleteBrand: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    next(new ValidationError("Brand ID is required"));
  }

  const brand = await prisma.brand.findUnique({
    where: { id },
  });

  if (!brand) {
    next(new ValidationError("Brand not found"));
  }

  await prisma.brand.delete({
    where: { id },
  });

  res.status(200).json({
    status: "success",
    message: "Brand deleted successfully",
  });
});
