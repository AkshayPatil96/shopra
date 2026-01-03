import { z } from "zod";

export const CategoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().optional(),
  summary: z.string().optional(),
  slug: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional().nullable(),
  order: z.coerce.number().int("Display order must be an integer").min(0, "Display order cannot be negative").default(0),
  isActive: z.boolean().default(true),
});

export type CategoryFormDTO = z.infer<typeof CategoryFormSchema>;

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string | null;
  parentName?: string | null;
  createdAt: string;
  description?: string;
  summary?: string;
  fullSlug?: string;
  order: number;
  isActive: boolean;
}
