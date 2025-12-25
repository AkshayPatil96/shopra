"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import useSeller from "@/hooks/useUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { SellerAuthAPI } from "@repo/shared-axios";
import { ShopCreationDTO, ShopCreationSchema } from "@repo/shared-types/index";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const items = [
  { label: "Select a category", value: "" },
  { label: "Clothing & Apparel", value: "clothing" },
  { label: "Electronics & Gadgets", value: "electronics" },
  { label: "Grocery & Supermarket", value: "grocery" },
  { label: "Restaurants & Cafés", value: "restaurants" },
  { label: "Beauty & Personal Care", value: "beauty" },
  { label: "Furniture & Home Decor", value: "furniture" },
  { label: "Automotive & Accessories", value: "automotive" },
  { label: "Books & Stationery", value: "books" },
  { label: "Toys & Games", value: "toys" },
  { label: "Sports & Fitness", value: "sports" },
  { label: "Hardware & Tools", value: "hardware" },
  { label: "Pet Supplies & Services", value: "pets" },
  { label: "Medical & Pharmacy", value: "medical" },
  { label: "Jewelry & Accessories", value: "jewelry" },
];

type Props = {
  handleStepClick: (step: number) => void;
};

const ShopSetup = ({ handleStepClick }: Props) => {
  const { refetch } = useSeller();

  const form = useForm<ShopCreationDTO>({
    resolver: zodResolver(ShopCreationSchema),
    defaultValues: {
      name: "",
      bio: "",
      address: "",
      opening_hours: "",
      website: "",
      category: "",
    },
  });

  const createShopMutation = useMutation({
    mutationFn: async (data: ShopCreationDTO) => {
      console.log("Creating shop with data:", data);
      const response = await SellerAuthAPI.createShop(data);
      return response;
    },
    onSuccess: (data, formData) => {
      console.log("Shop creation successful:", data);
      handleStepClick(2);
      toast.success("Shop created successfully!");
      refetch();
    },
    onError: (error: any) => {
      console.error("Shop creation error:", error);
      toast.error(error?.message || "Something went wrong.");
    },
  });

  const onSubmit = async (data: ShopCreationDTO) => {
    console.log("Form Data:", data);
    await createShopMutation.mutateAsync(data);
  };

  return (
    <div className="w-full lg:w-1/2 mt-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl uppercase">Set up your shop details</h1>
        <p className="mt-2 text-sm text-secondary-foreground">
          Provide your shop information to get started selling your products.
        </p>
      </div>

      <Form {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="w-full mx-auto flex flex-col gap-4">
            {/* Shop Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-medium">
                    Shop Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      aria-label="Shop Name"
                      placeholder="Enter your shop name"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-medium">
                    Bio (Max 100 words) *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      aria-label="Bio"
                      placeholder="Enter your shop bio..."
                      rows={4}
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        const words = value.split(/\s+/);
                        if (words.filter(Boolean).length <= 100) {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-medium">
                    Shop Address *
                  </FormLabel>
                  <FormControl>
                    <Input
                      aria-label="Shop Address"
                      placeholder="Enter your shop address"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Opening Hours */}
            <FormField
              control={form.control}
              name="opening_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-medium">
                    Opening Hours *
                  </FormLabel>
                  <FormControl>
                    <Input
                      aria-label="Opening Hours"
                      placeholder="e.g., Mon-Fri 9am-5pm"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-medium">
                    Website *
                  </FormLabel>
                  <FormControl>
                    <Input
                      aria-label="Website"
                      placeholder="Enter your shop website"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-sm font-medium">
                    Category *
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {field.value
                            ? items.find((item) => item.value === field.value)
                                ?.label
                            : "Select a category"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {items.map(({ label, value }) => (
                          <SelectItem
                            key={value}
                            value={value}
                          >
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-2 w-full"
              disabled={createShopMutation.isPending}
            >
              {createShopMutation.isPending ? "Saving..." : "Save and Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ShopSetup;
