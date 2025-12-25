import { z } from "zod";

export const VariantAttributeSchema = z.object({
  key: z.string().min(1, "Attribute key is required"),
  values: z.array(z.string().min(1)).min(1, "At least one value"),
});

const ShippingSchema = z.object({
  // Shipping details
  stock: z
    .number({ error: "Stock must be a number" })
    .int()
    .nonnegative()
    .default(0),
  weight: z
    .number({ error: "Weight must be a number" })
    .nonnegative()
    .optional()
    .nullable(),
  length: z
    .number({ error: "Length must be a number" })
    .nonnegative()
    .optional()
    .nullable(),
  width: z
    .number({ error: "Width must be a number" })
    .nonnegative()
    .optional()
    .nullable(),
  height: z
    .number({ error: "Height must be a number" })
    .nonnegative()
    .optional()
    .nullable(),
});

const PricingSchema = z.object({
  price: z
    .number({ error: "Price must be a number" })
    .nonnegative()
    .optional()
    .nullable(),
  compareAtPrice: z
    .number({ error: "Compare at price must be a number" })
    .nonnegative()
    .optional()
    .nullable(),
});

const variantBaseSchema = z.object({
  id: z.string().optional(),
  // attributes as dynamic key/value map
  attributes: z.record(z.string(), z.string()).default({}),

  stock: z
    .number({ error: "Stock must be a number" })
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative")
    .default(0),
  sku: z.string().optional(),

  // for now treat image as string | null (you can wire upload later)
  imageUrl: z.string().optional().or(z.literal("")).optional(),
});

export const VariantFormSchema = variantBaseSchema.merge(PricingSchema).merge(ShippingSchema);

export const ProductFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),

  description: z.string().optional(),
  summary: z.string().optional(),

  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),


  // Image URLs for now; replace with file upload later
  imageUrls: z.array(z.string()).optional(),

  variants: z.array(VariantFormSchema).min(1, "At least one variant is required").optional(),
});

export type ProductFormValues = z.infer<typeof ProductFormSchema>;
export type ProductVariantValues = z.infer<typeof VariantFormSchema>;
export type VariantAttributeValues = z.infer<typeof VariantAttributeSchema>;

// ===========================================================

export const VariantZ = z.object({
  sku: z.string().optional(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  attributes: z.record(z.string(), z.any()).optional(),
});


export const CreateProductZ = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  imageIds: z.array(z.string()).optional(),
  variants: z.array(VariantZ).min(1).optional(), // allow 0 or 1 variants too if you want
});

export type CreateProductDTO = z.infer<typeof CreateProductZ>;
export type VariantDTO = z.infer<typeof VariantZ>;
