"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { z } from "zod";
import { CreateBrandSchema } from "@repo/shared-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCreateBrand, useUpdateBrand } from "@/lib/api/brands";

export type BrandFormValues = z.infer<typeof CreateBrandSchema>;

interface BrandFormProps {
  mode: "add" | "edit";
  id?: string;
  brand?: BrandFormValues;
  onClose?: () => void;
}

const defaultValues: BrandFormValues = {
  name: "",
  slug: "",
  logoUrl: null,
  isActive: true,
};

export default function BrandForm({
  mode,
  id,
  brand,
  onClose,
}: BrandFormProps) {
  const router = useRouter();
  const form = useForm<BrandFormValues | any>({
    resolver: zodResolver(CreateBrandSchema),
    defaultValues: brand ?? defaultValues,
  });

  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const isEditMode = mode === "edit";

  const { watch, setValue, handleSubmit } = form;
  const nameValue = watch("name");

  useEffect(() => {
    const generatedSlug = nameValue
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (generatedSlug) {
      setValue("slug", generatedSlug);
    }
  }, [nameValue, setValue]);

  useEffect(() => {
    if (brand) {
      form.reset(brand);
    }
  }, [brand, form]);

  const handleSuccess = (message: string) => {
    toast.success(message);
    router.refresh();
    form.reset(defaultValues);
    onClose?.();
  };

  const onSubmit = async (values: BrandFormValues) => {
    if (isEditMode && !id) {
      toast.error("Missing brand identifier.");
      return;
    }

    if (isEditMode && id) {
      await updateBrand.mutateAsync(
        { id, data: values },
        {
          onSuccess: () => handleSuccess("Brand updated successfully!"),
          onError: (error: any) => {
            toast.error(error?.message || "Failed to update brand.");
          },
        },
      );
      return;
    }

    await createBrand.mutateAsync(values, {
      onSuccess: () => handleSuccess("Brand created successfully!"),
      onError: (error: any) => {
        toast.error(error?.message || "Failed to create brand.");
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Nike, Apple"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl>
                <Input
                  placeholder="mens-clothing"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                URL identifier. Auto-generated from the name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-xl border p-4">
              <div className="space-y-1">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Disable to keep this brand hidden from storefronts.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEditMode ? "Update Brand" : "Create Brand"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
