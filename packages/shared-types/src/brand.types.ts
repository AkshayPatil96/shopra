import { z } from "zod";

export const CreateBrandSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  logoUrl: z.url().optional().nullable(),
});

export type CreateBrandDTO = z.infer<typeof CreateBrandSchema>;

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}