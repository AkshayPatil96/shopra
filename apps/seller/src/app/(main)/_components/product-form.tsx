// app/seller/products/add/ProductForm.tsx
"use client";

import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
// import { VariantBuilder } from "./VariantBuilder";
import {
  CreateProductZ as ProductFormSchema,
  CreateProductDTO as ProductFormValues,
} from "@repo/shared-types/index";
import { useGetCategories } from "@/lib/api/categories";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetBrands } from "@/lib/api/brands";

// TODO: replace with real API calls / queries
const mockCategories = [
  { id: "cat_men_clothing", name: "Men Clothing" },
  { id: "cat_women_clothing", name: "Women Clothing" },
];
const mockBrands = [
  { id: "brand_nike", name: "Nike" },
  { id: "brand_apple", name: "Apple" },
];

export default function ProductForm() {
  const [submitting, setSubmitting] = useState(false);

  const { data: categoriesData, isFetching: isCategoriesFetching } =
    useGetCategories({ select: "options" }) as any;
  const categories = categoriesData?.data || [];

  const { data: brandsData, isFetching: isBrandsFetching } = useGetBrands({
    select: "options",
  }) as any;
  const brands = brandsData?.data || [];

  const form = useForm(
    // <ProductFormValues>
    {
      // resolver: zodResolver(ProductFormSchema),
      defaultValues: {
        title: "",
        summary: "",
        description: "",
        categoryId: "",
        brandId: "",
        basePrice: 0,
        salePrice: undefined,
        hasVariants: false,
        stock: 0,
        imageUrls: [],
        variantAttributes: [],
        variants: [],
      },
      mode: "onBlur",
    },
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const hasVariants = watch("hasVariants");

  const onSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);
    try {
      // Convert to backend payload shape
      const payload = {
        ...values,
        // Example: if no variants, flatten stock & basePrice for backend
        variants:
          values.variants && values.variants.length > 0 ? values.variants : [],
      };

      console.log("Submitting product payload:", payload);

      // TODO: call your API here
      // await axios.post("/api/products", payload);

      // Toast success...
    } catch (error) {
      console.error(error);
      // Toast error...
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* STEP 1: Basic info */}
          <section className="space-y-4 rounded-xl border p-4">
            <h2 className="font-semibold">Basic Information</h2>

            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Classic Cotton T-Shirt"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Summarize your product, materials, fit, etc. in 150 words."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Describe your product, materials, fit, etc. in 500 words."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue="next"
                        items={categories.map((cat: any) => ({
                          label: cat.name,
                          value: cat.id,
                        }))}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {field.value
                              ? categories.find(
                                  (cat: any) => cat.id === field.value,
                                )?.name
                              : "Select category"}
                          </SelectValue>
                        </SelectTrigger>
                        {isCategoriesFetching ? (
                          <SelectPopup>
                            <SelectItem
                              value=""
                              disabled
                            >
                              Loading...
                            </SelectItem>
                          </SelectPopup>
                        ) : (
                          <SelectPopup>
                            <SelectItem value=""> Select category </SelectItem>
                            {categories.map((cat: any) => (
                              <SelectItem
                                key={cat.id}
                                value={cat.id}
                              >
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectPopup>
                        )}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue="next"
                        items={brands.map((brand: any) => ({
                          label: brand.name,
                          value: brand.id,
                        }))}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {field.value
                              ? brands.find(
                                  (brand: any) => brand.id === field.value,
                                )?.name
                              : "Select brand"}
                          </SelectValue>
                        </SelectTrigger>
                        {isBrandsFetching ? (
                          <SelectPopup>
                            <SelectItem
                              value=""
                              disabled
                            >
                              Loading...
                            </SelectItem>
                          </SelectPopup>
                        ) : (
                          <SelectPopup>
                            <SelectItem value=""> Select brand </SelectItem>
                            {brands.map((brand: any) => (
                              <SelectItem
                                key={brand.id}
                                value={brand.id}
                              >
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectPopup>
                        )}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* STEP 2: Pricing */}
          <section className="space-y-4 rounded-xl border p-4">
            <h2 className="font-semibold">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value || "0"))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale price (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    {/* <FormDescription>
                      If set, this will be shown as discounted price.
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!hasVariants && (
                <FormField
                  control={control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock (no variants)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value || "0", 10))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </section>

          {/* STEP 3: Variants toggle */}
          <section className="space-y-4 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Variants</h2>
                <p className="text-xs text-muted-foreground">
                  Enable if this product has options like size, color, storage,
                  etc.
                </p>
              </div>

              <FormField
                control={control}
                name="hasVariants"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel>Has variants?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(val) => field.onChange(val)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* {hasVariants && (
              <VariantBuilder
                basePrice={watch("basePrice")}
                onVariantsChange={(variants: any, attrs: any) => {
                  setValue("variants", variants);
                  setValue("variantAttributes", attrs);
                }}
              />
            )} */}
          </section>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => {
                form.reset();
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
