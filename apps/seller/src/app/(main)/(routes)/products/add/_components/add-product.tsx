"use client";

import React from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// shadcn UI components (assume these exist in your component library)
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// shared types (from your monorepo shared-types package)
import type {
  CreateProductDTO,
  // Product,
  VariantDTO,
} from "@repo/shared-types";

// api client (you likely have a shared axios or fetch wrapper)
import { Select, SelectItem } from "@/components/ui/select";

// -----------------------------
// Zod schema for Create Product
// -----------------------------
const VariantZ = z.object({
  sku: z.string().optional(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  attributes: z.record(z.string(), z.any()).optional(),
});

const CreateProductZ = z.object({
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

type CreateProductForm = z.infer<typeof CreateProductZ>;

// -----------------------------
// UI Subcomponents (small, focused)
// Each exported so you can compose / test separately
// -----------------------------

export function CategoryBrandSelect({
  onChange,
  value,
}: {
  onChange: (v: string) => void;
  value?: string;
}) {
  // // Example categories/brands could be fetched via queries
  // const { data: categories = [] } = useQuery(["categories"], async () => {
  //   const { data } = await api.get("/categories");
  //   return data;
  // });
  // const { data: brands = [] } = useQuery(["brands"], async () => {
  //   const { data } = await api.get("/brands");
  //   return data;
  // });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Category</Label>
        {/* <Select
          value={value}
          onValueChange={onChange}
          placeholder="Select category"
        >
          {categories.map((c: any) => (
            <SelectItem
              key={c.id}
              value={c.id}
            >
              {c.name}
            </SelectItem>
          ))}
        </Select> */}
      </div>
      <div>
        <Label>Brand</Label>
        {/* <Select
          value={value}
          onValueChange={onChange}
          placeholder="Select brand"
        >
          {brands.map((b: any) => (
            <SelectItem
              key={b.id}
              value={b.id}
            >
              {b.name}
            </SelectItem>
          ))}
        </Select> */}
      </div>
    </div>
  );
}

export function ImagesUploader({
  value = [],
  onChange,
}: {
  value?: string[];
  onChange: (v: string[]) => void;
}) {
  // Keep this simple for MVP: user can paste image URLs or select file (upload logic external)
  const [list, setList] = React.useState<string[]>(value || []);
  React.useEffect(() => onChange(list), [list]);

  return (
    <div>
      <Label>Images (paste URLs for now)</Label>
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Paste image URL and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = (e.target as HTMLInputElement).value.trim();
              if (val) {
                setList((s) => [...s, val]);
                (e.target as HTMLInputElement).value = "";
              }
            }
          }}
        />
        <Button
          type="button"
          onClick={() =>
            navigator.clipboard
              .readText()
              .then((t) => t && setList((s) => [...s, t]))
          }
        >
          Paste
        </Button>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2">
        {list.map((url, i) => (
          <div
            key={i}
            className="border rounded p-1 flex flex-col"
          >
            <img
              src={url}
              alt={`img-${i}`}
              className="h-24 object-cover rounded"
            />
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setList((s) => s.filter((_, idx) => idx !== i))}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VariantsEditor({ control, register, errors }: any) {
  // useFieldArray to manage variants
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create product variants (size / color / custom attributes) as
              JSON.
            </p>
          </CardContent>
        </Card>
        <Button
          onClick={() =>
            append({ sku: "", price: 0, stock: 0, attributes: {} })
          }
        >
          Add variant
        </Button>
      </div>

      {fields.map((f: any, idx) => (
        <div
          key={f.id}
          className="border rounded p-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>SKU</Label>
              <Input
                {...register(`variants.${idx}.sku`)}
                defaultValue={f.sku}
              />
            </div>
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                {...register(`variants.${idx}.price`, { valueAsNumber: true })}
                defaultValue={f.price}
              />
            </div>
            <div>
              <Label>Compare at price</Label>
              <Input
                type="number"
                {...register(`variants.${idx}.compareAtPrice`, {
                  valueAsNumber: true,
                })}
                defaultValue={f.compareAtPrice}
              />
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                {...register(`variants.${idx}.stock`, { valueAsNumber: true })}
                defaultValue={f.stock}
              />
            </div>
          </div>

          <div className="mt-3">
            <Label>Attributes (JSON)</Label>
            <Textarea
              {...register(`variants.${idx}.attributes`)}
              placeholder='{ "color": { "name": "Black", "hex": "#000" } }'
            />
            <div className="flex justify-end mt-2">
              <Button
                variant="destructive"
                onClick={() => remove(idx)}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// -----------------------------
// Main Form component (composed of smaller components)
// -----------------------------
export default function SellerCreateProductPage() {
  const methods = useForm<CreateProductForm>({
    resolver: zodResolver(CreateProductZ),
    defaultValues: { variants: [] },
  });
  const { handleSubmit, control, register } = methods;

  const onSubmit = async (data: CreateProductForm) => {
    // transform to CreateProductDto as needed (shared-types)
    const payload: CreateProductDTO = {
      title: data.title,
      slug: data.slug || undefined,
      description: data.description,
      summary: data.summary,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      categoryId: data.categoryId,
      brandId: data.brandId,
      imageIds: data.imageIds,
      variants: (data.variants || []).map((v) => ({
        sku: v.sku,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stock: v.stock,
        attributes:
          typeof v.attributes === "string"
            ? JSON.parse(v.attributes || "{}")
            : v.attributes,
      })) as VariantDTO[],
    };

    console.log("payload: ", payload);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Product</h1>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Basic details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input {...register("title")} />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input {...register("slug")} />
                </div>
                <div>
                  <Label>Summary</Label>
                  <Input {...register("summary")} />
                </div>
              </div>

              <div className="mt-4">
                <Label>Description</Label>
                <Textarea {...register("description")} />
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Price (optional)</Label>
                  <Input
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label>Compare At Price (optional)</Label>
                  <Input
                    type="number"
                    {...register("compareAtPrice", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category & Brand</CardTitle>
            </CardHeader>
            <CardContent>
              {/* CategoryBrandSelect: we use callbacks to set form values */}
              <CategoryBrandSelect
                onChange={(v) => methods.setValue("categoryId", v)}
                value={methods.getValues("categoryId")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImagesUploader
                value={methods.getValues("imageIds") || []}
                onChange={(v) => methods.setValue("imageIds", v)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <VariantsEditor
                control={control}
                register={register}
              />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit">Create product</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => methods.reset()}
            >
              Reset
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

/*
Notes:
- Replace `api` with your shared axios/fetch client; endpoints are placeholders (/seller/products, /categories, /brands)
- `coss-ui` imports are placeholders for the select components you mentioned; replace them with your actual package paths
- `shared-types` imports assume types like CreateProductDto, Product, ProductVariantDto exist
- The VariantsEditor keeps attributes as a JSON textarea for MVP. You can later replace it with a dynamic attributes form.
- This file exports multiple focused components so you can test/render them independently in storybook or pages.
*/
