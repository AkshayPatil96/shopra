import z from "zod";

export const ShopCreationSchema = z.object({
  name: z.string().min(3, "Shop name must be at least 3 characters long"),
  bio: z
    .string()
    .min(1, "Bio is required"),
  address: z.string().min(10, "Address must be at least 10 characters long"),
  // sellerId: z.string().uuid("Invalid seller ID"),
  opening_hours: z.string().min(1, "Opening hours are required"),
  category: z.string().min(1, "Category is required"),
  website: z.url("Invalid website URL"),
});

export type ShopCreationDTO = z.infer<typeof ShopCreationSchema>;