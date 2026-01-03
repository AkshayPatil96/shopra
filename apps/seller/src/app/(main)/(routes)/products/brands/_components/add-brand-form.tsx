"use client";

import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import type { z } from "zod";
import { CreateBrandDTO, CreateBrandSchema } from "@repo/shared-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCreateBrand, useUpdateBrand } from "@/lib/api/brands";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";

type BrandFormValues = z.infer<typeof CreateBrandSchema>;

export default function AddBrandForm({
  brand,
  id,
}: {
  brand?: BrandFormValues;
  id?: string;
}) {
  const router = useRouter();
  const isEditMode = Boolean(brand);

  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<BrandFormValues | any>({
    resolver: zodResolver(CreateBrandSchema),
    defaultValues: {
      name: "",
      slug: "",
      logoUrl: null,
      isActive: true,
    },
  });

  const { watch, setValue, handleSubmit } = form;
  const nameValue = watch("name");

  useEffect(() => {
    // Auto-generate slug from name
    const generatedSlug = nameValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValue("slug", generatedSlug);
  }, [nameValue, setValue]);

  useEffect(() => {
    if (brand) {
      form.reset(brand);
    }
  }, [brand, form]);

  const createBrand = useCreateBrand();

  const updateBrand = useUpdateBrand();

  const onSubmit = async (values: BrandFormValues) => {
    console.log("Submitting brand:", values);

    if (isEditMode && id) {
      await updateBrand.mutateAsync(
        { id, data: values },
        {
          onSuccess: () => {
            toast.success("Brand updated successfully!");
            form.reset();
            setDialogOpen(false);
            router.push("/products/brands");
          },
          onError: (error: any) => {
            toast.error(error?.message || "Failed to update brand.");
            console.error("Brand update error:", error);
          },
        },
      );
    } else {
      await createBrand.mutateAsync(values, {
        onSuccess: () => {
          toast.success("Brand created successfully!");
          form.reset();
          setDialogOpen(false);
          router.push("/products/brands");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to create brand.");
          console.error("Brand creation error:", error);
        },
      });
    }
  };

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => setDialogOpen(open)}
      >
        <DialogTrigger render={<Button />}>
          <PlusIcon />
          Add Brand
        </DialogTrigger>
        <DialogPopup className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Brand" : "Add New Brand"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the details of your brand."
                : "Fill in the details to create a new brand."}
            </DialogDescription>
          </DialogHeader>

          <DialogPanel className="grid gap-4">
            <Form {...form}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Brand Name */}
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

                {/* Slug */}
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
                        URL identifier. Auto-generated from name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
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

                {/* Icon URL */}
                {/* <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/logo.png"
                          type="url"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value)
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                {/* Submit */}
                <DialogFooter
                  variant="bare"
                  className="border-t"
                >
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button type="submit">
                    {isEditMode ? "Update Brand" : "Create Brand"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogPanel>
        </DialogPopup>
      </Dialog>
    </>
  );
}
