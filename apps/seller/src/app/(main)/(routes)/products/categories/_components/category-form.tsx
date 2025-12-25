"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoryFormDTO, CategoryFormSchema } from "@repo/shared-types/index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  useCreateCategory,
  useGetCategories,
  useUpdateCategory,
} from "@/lib/api/categories";

// ❗ Replace with actual API & your categories fetch
const mockCategories = [
  { value: "cat_men", label: "Men Clothing" },
  { value: "cat_women", label: "Women Clothing" },
  { value: "cat_electronics", label: "Electronics" },
];

export default function AddCategoryForm({
  category,
  id,
}: {
  category?: CategoryFormDTO;
  id?: string;
}) {
  const router = useRouter();
  const isEditMode = Boolean(category);

  const { data, isFetching } = useGetCategories() as any;
  console.log("data: ", data);
  let categoriesData = data?.data?.map(({ id, name, slug }: any) => ({
    value: id,
    label: name,
  })) as
    | {
        label: string;
        value: string;
      }[]
    | [];

  console.log("isEditMode: ", isEditMode);
  console.log("id: ", id);
  console.log("categoriesData: ", categoriesData);
  categoriesData =
    isEditMode && id && categoriesData?.length
      ? categoriesData.filter((cat) => cat?.value !== id)
      : categoriesData;

  const form = useForm<CategoryFormDTO>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: "",
      icon: "",
      parentId: null,
      description: "",
      summary: "",
    },
  });

  const { watch, setValue, handleSubmit } = form;
  const nameValue = watch("name");
  const parentIdValue = watch("parentId");
  console.log("parentIdValue: ", parentIdValue);

  useEffect(() => {
    if (category) {
      form.reset(category);
    }
  }, [category, form]);

  const createCategory = useCreateCategory();

  const updateCategory = useUpdateCategory();

  const onSubmit = async (values: CategoryFormDTO) => {
    console.log("Submitting category:", values);

    if (isEditMode && id) {
      await updateCategory.mutateAsync(
        { id, data: values },
        {
          onSuccess: () => {
            toast.success("Category updated successfully!");
            form.reset();
            router.push("/products/categories");
          },
          onError: (error: any) => {
            toast.error(error?.message || "Failed to update category.");
            console.error("Category update error:", error);
          },
        },
      );
    } else {
      await createCategory.mutateAsync(values, {
        onSuccess: () => {
          toast.success("Category created successfully!");
          form.reset();
          router.push("/products/categories");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to create category.");
          console.error("Category creation error:", error);
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 border rounded-xl p-6"
      >
        {/* Category Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Men's Clothing"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Summary */}
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary (Max 150 words)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief summary of the category"
                  {...field}
                  onChange={(e) => {
                    const words = e.target.value.split(/\s+/).slice(0, 150);
                    if (words.length <= 150) {
                      field.onChange(words.join(" "));
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the category"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parent Category */}
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {field.value
                        ? categoriesData.find(
                            (item) => item.value === field.value,
                          )?.label
                        : "Select a category"}
                    </SelectValue>
                  </SelectTrigger>
                  {isFetching ? (
                    <SelectContent>
                      <SelectItem value="">Loading categories...</SelectItem>
                    </SelectContent>
                  ) : categoriesData?.length ? (
                    <SelectContent>
                      <SelectItem value="">Select a category</SelectItem>
                      {categoriesData.map(
                        ({
                          label,
                          value,
                        }: {
                          label: string;
                          value: string;
                        }) => (
                          <SelectItem
                            key={value}
                            value={value}
                          >
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  ) : (
                    <SelectContent>
                      <SelectItem value="">No categories available</SelectItem>
                    </SelectContent>
                  )}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Icon URL */}
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/icon.png"
                  {...field}
                />
              </FormControl>
              {/* <FormDescription>
                Used for UI – category icon or image.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        {/* <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="mens-clothing"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                URL identifier. Auto-generated from name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              router.push("/products/categories");
            }}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEditMode ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
